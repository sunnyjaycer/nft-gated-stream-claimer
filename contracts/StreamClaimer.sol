//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {SuperTokenV1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperTokenV1Library.sol";

error Unauthorized();

contract StreamClaimer {

    error NO_GATE_NFT();
    error HAS_GATE_NFT();

    /// @notice Super Token Library.
    using SuperTokenV1Library for ISuperToken;

    /// @notice NFT contract used for gating
    IERC721 public gateNFT;

    /// @notice Super Token that holders of gateNFT can claim streams of
    ISuperToken public rewardSuperToken;

    /// @notice constant for a flow rate of 3858024691358 wei/sec. which equals 10 tokens/mo.
    int96 public constant TEN_PER_MONTH = 3858024691358;

    constructor(ISuperToken _rewardSuperToken, IERC721 _gateNFT) {

        rewardSuperToken = _rewardSuperToken;
        gateNFT = _gateNFT;
        
    }

    /// @notice Create flow from contract to specified address.
    function claimStream() external {

        // if receiver doesn't have a gateNFT, revert
        if (gateNFT.balanceOf(msg.sender) == 0) revert NO_GATE_NFT();

        // attempt to create a stream of 3858024691358 wei/sec (10 tokens/mo.) worth of rewardSuperToken
        // inherently reverts if a stream already exists fo caller
        rewardSuperToken.createFlow(msg.sender, TEN_PER_MONTH);

    }


    /// @notice Delete flow from contract to specified address if that address doesn't have a gateNFT
    /// @param receiver Current receiver of a stream.
    function cancelStream(address receiver) external {

        // if receiver has a gateNFT, revert
        if (gateNFT.balanceOf(receiver) > 0) revert HAS_GATE_NFT();

        rewardSuperToken.deleteFlow(address(this), receiver);
    }
}