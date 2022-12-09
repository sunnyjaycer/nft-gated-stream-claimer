//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SunnyNft is ERC721 {

    uint256 public tokenId;

    constructor() ERC721("Sunny NFT", "SUNFT") {}

    function mint(address to) public {
        tokenId++;
        _safeMint(to, tokenId);
    }
}