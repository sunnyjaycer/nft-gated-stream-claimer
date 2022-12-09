//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ISuperfluid, ISuperToken, ISuperApp} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {ISuperfluidToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluidToken.sol";
import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import {CFAv1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";

error Unauthorized();

contract StreamClaimer {

    error NO_GATE_NFT();
    error STILL_HOLDING();

    /// @notice CFA Library.
    using CFAv1Library for CFAv1Library.InitData;
    CFAv1Library.InitData public cfaV1;

    /// @notice NFT contract used for gating
    IERC721 public gateNFT;

    /// @notice Super Token that holders of gateNFT can claim streams of
    ISuperToken public rewardSuperToken;

    /// @notice constant for a flow rate of 3858024691358 wei/sec. which equals 10 tokens/mo.
    int96 public constant TEN_PER_MONTH = 3858024691358;

    constructor(ISuperToken _rewardSuperToken, IERC721 _gateNFT) {

        rewardSuperToken = _rewardSuperToken;
        gateNFT = _gateNFT;
        
        // Initialize CFA Library
        ISuperfluid host = ISuperfluid(_rewardSuperToken.getHost());

        cfaV1 = CFAv1Library.InitData(
            host,
            IConstantFlowAgreementV1(
                address(
                    host.getAgreementClass(
                        keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1")
                    )
                )
            )
        );

    }

    /// @notice Create flow from contract to specified address.
    function claimStream() external {

        // if receiver doesn't have a gateNFT, revert
        if (gateNFT.balanceOf(msg.sender) == 0) revert NO_GATE_NFT();

        // attempt to create a stream of 3858024691358 wei/sec (10 tokens/mo.) worth of rewardSuperToken
        // inherently reverts if a stream already exists fo caller
        cfaV1.createFlow(msg.sender, rewardSuperToken, TEN_PER_MONTH);

    }


    /// @notice Delete flow from contract to specified address if that address doesn't have a gateNFT
    /// @param receiver Current receiver of a stream.
    function cancelStream(address receiver) external {

        // if receiver has a gateNFT, revert
        if (gateNFT.balanceOf(receiver) > 0) revert NO_GATE_NFT();

        cfaV1.deleteFlow(address(this), receiver, rewardSuperToken);
    }
}