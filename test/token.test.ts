/* eslint-disable prettier/prettier */
import chai, { expect } from "chai";
import { Signer, Wallet } from "ethers";
import { ethers, waffle, network } from "hardhat";
import { deployTestToken } from "./helpers/deploy";
import { erc20, formatUSDC, parseUSDC, skipTimeDays } from "./helpers/helpers";
import { TestToken } from "@typechain/TestToken";

// Still have to declare module
const { BN, constants } = require("@openzeppelin/test-helpers");
const { ZERO_ADDRESS } = constants;

const name = "TestToken";
const symbol = "TST";
const cap = 1_000_000;

const initialSupply = 0;

describe("Deploy Token Contract", async () => {
  let testToken: TestToken, owner: Signer, recipient: Signer;
  
  beforeEach(async () => {
    [owner, recipient] = await ethers.getSigners();
    testToken = await deployTestToken(owner, name, symbol, cap);
  });

  it("has a name", async function () {
    expect(await testToken.name()).to.equal(name);
  });

  it("has a symbol", async function () {
    expect(await testToken.symbol()).to.equal(symbol);
  });

  it("has 18 decimals", async function () {
    expect(await testToken.decimals()).to.equal(18);
  });

  describe("Minting tokens", function () {
    const amount = 100_000;

    beforeEach("minting", async function () {
      const logs = await testToken.mint(await recipient.getAddress(), amount);
    });

    it("increments totalSupply", async function () {
      const expectedSupply = initialSupply + amount;
      expect(await testToken.totalSupply()).to.equal(expectedSupply);
    });

    it("increments recipient balance", async function () {
      expect(await testToken.balanceOf(await recipient.getAddress())).to.equal(
        amount
      );
    });

    it("cannot mint more then cap", async function () {
      expect(
        testToken.mint(await recipient.getAddress(), cap + amount)
      ).to.be.revertedWith("ERC20Capped: cap exceeded");
    });

    it("cannot mint to zero address", async function () {
      expect(testToken.mint(ZERO_ADDRESS, amount)).to.be.revertedWith(
        "ERC20: mint to the zero address"
      );
    });
  });

  describe("Decrease allowance", async function () {
    
    function shouldDecreaseApproval (amount: number) {
      describe('when there was no approved amount before', function () {
        it('reverts', async function () {
          await expect(testToken.decreaseAllowance(
            await recipient.getAddress(), amount, { from: await owner.getAddress() }))
            .to.be.revertedWith('ERC20: decreased allowance below zero')
          });
        });

    describe('when the spender had an approved amount', function () {
      const approvedAmount = amount;
        
      beforeEach(async function () {
        const logs = await testToken.approve(await recipient.getAddress(), approvedAmount, { from: await owner.getAddress() });
      });

      it('decreases the spender allowance subtracting the requested amount', async function () {
        await testToken.decreaseAllowance(await recipient.getAddress(), approvedAmount - 1, { from: await owner.getAddress() });
        expect(await testToken.allowance(await owner.getAddress(), await recipient.getAddress())).to.be.equal('1');
      });

      it('sets the allowance to zero when all allowance is removed', async function () {
        await testToken.decreaseAllowance(await recipient.getAddress(), approvedAmount, { from: await owner.getAddress() });
        expect(await testToken.allowance(await owner.getAddress(), await recipient.getAddress())).to.be.equal('0');
      });

      it('reverts when more than the full allowance is removed', async function () {
        await expect(
          testToken.decreaseAllowance(await recipient.getAddress(), approvedAmount + 1 , { from: await owner.getAddress() }))
          .to.be.revertedWith('ERC20: decreased allowance below zero')
      });
    });
  }

  describe('when the sender has enough balance', function () {
    const amount = 100_000;
    shouldDecreaseApproval(amount);
  });

  describe('when the sender does not have enough balance', function () {
    const amount = 100_000 + 1;
    shouldDecreaseApproval(amount);
  });

  });
});



