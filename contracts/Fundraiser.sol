//! Fundraiser contract. Just records who sent what.
//! By Parity Technologies, 2017.
//! Released under the Apache Licence 2.
//! Modified by the Interchain Foundation.

pragma solidity ^0.4.11;

//import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./SafeMath.sol";

/// Will accept Ether "contributions" and records each both as a log and in a
/// queryable records.
contract Fundraiser {
    using SafeMath for uint;

    // How much is enough?
    uint public constant dust = 180 finney;

    // Special addresses:
    //  administrator can halt/unhalt/kill/adjustRate;
    //  treasury receives all the funds
    address public admin;
    address public treasury;

    // Begin and end block for the fundraising period
    uint public beginBlock;
    uint public endBlock;

    // Number of wei per btc
    uint public weiPerBtc;

    // Default number of etm per btc
    uint public defaultEtmPerBtc;

    // Are contributions abnormally halted?
    bool public isHalted = false;

    // The `records` mapping maps musereum addresses to the amount of ETM.
    mapping (address => uint) public records;

    // The `coupons` mapping maps coupon to the amount of ETM.
    mapping (bytes32 => uint) private coupons;

    // The total amount of ether raised
    uint public totalWei = 0;
    // The total amount of ETM suggested for allocation
    uint public totalETM = 0;
    // The number of donation
    uint public numDonations = 0;

    /// Constructor. `_admin` has the ability to pause the
    /// contribution period and, eventually, kill this contract. `_treasury`
    /// receives all funds. `_beginBlock` and `_endBlock` define the begin and
    /// end of the period. `_weiPerBtc` is the ratio of ETM to ether.
    function Fundraiser(
        address _admin,
        address _treasury,
        uint _beginBlock,
        uint _endBlock,
        uint _weiPerBtc,
        uint _defaultEtmPerBtc
    ) {
        require(_weiPerBtc > 0);
        require(_defaultEtmPerBtc > 0);

        admin = _admin;
        treasury = _treasury;
        beginBlock = _beginBlock;
        endBlock = _endBlock;

        weiPerBtc = _weiPerBtc;
        defaultEtmPerBtc = _defaultEtmPerBtc;
    }

    // Can only be called by admin.
    modifier only_admin { require(msg.sender == admin); _; }
    // Can only be called by prior to the period.
    modifier only_before_period { require(block.number < beginBlock); _; }
    // Can only be called during the period when not halted.
    modifier only_during_period { require(block.number >= beginBlock || block.number < endBlock && !isHalted); _; }
    // Can only be called during the period when halted.
    modifier only_during_halted_period { require(block.number >= beginBlock || block.number < endBlock && isHalted); _; }
    // Can only be called after the period.
    modifier only_after_period { require(block.number >= endBlock); _; }
    // The value of the message must be sufficiently large to not be considered dust.
    modifier is_not_dust { require(msg.value >= dust); _; }

    /// Some contribution `amount` received from `recipient` at rate of `currentRate` with emergency return of `returnAddr`.
    event Received(
        address indexed recipient,
        address returnAddr,
        uint weiAmount,
        uint currentRate,
        uint etmAmount,
        uint etmPerBTCRate,
        uint weiPerBTCRate
    );
    /// Period halted abnormally.
    event Halted();
    /// Period restarted after abnormal halt.
    event Unhalted();
    event RateChanged(uint newRate);

    // Is the fundraiser active?
    function isActive() public constant returns (bool active) {
        return (block.number >= beginBlock && block.number < endBlock && !isHalted);
    }

    function getRate(bytes32 coupon) public constant returns(uint) {
        if (coupons[coupon] != 0) {
            return coupons[coupon];
        }

        return defaultEtmPerBtc;
    }

    // TODO: beautyfree - string coupon
    /// Receive a contribution for a donor musereum address.
    function donate(address _donor, address _returnAddress, bytes4 checksum, bytes32 coupon) public payable only_during_period is_not_dust {
        // checksum is the first 4 bytes of the sha3 of the xor of the bytes32 versions of the musereum address and the return address
        require( bytes4(sha3( bytes32(_donor)^bytes32(_returnAddress) )) == checksum );

        uint weiAmount = msg.value;

        // forward the funds to the treasurer
        require( treasury.send(weiAmount) );

        // calculate the number of ETM at the current rate
        uint etmPerBTC = getRate(coupon);
        uint weiPerETM = etmPerBTC.mul(weiPerBtc);
        uint ETM = weiAmount.div(weiPerETM);

        // update the donor details
        records[_donor] = records[_donor].add(ETM);

        // update the totals
        totalWei = totalWei.add(weiAmount);
        totalETM = totalETM.add(ETM);
        numDonations = numDonations.add(1);

        Received(_donor, _returnAddress, weiAmount, weiPerETM, ETM, etmPerBTC, weiPerBtc);
    }

    /// Adjust the weiPerBtc rate
    function adjustRate(uint newRate) public only_admin returns(bool success) {
        weiPerBtc = newRate;
        RateChanged(newRate);
        return true;
    }

    /// Add coupon
    function addCoupon(bytes32 coupon, uint etmPerBTC) public only_admin returns(bool success) {
        coupons[coupon] = etmPerBTC;
        return true;
    }

    /// Remove coupon
    function deleteCoupon(bytes32 coupon) public only_admin returns(bool success) {
        delete coupons[coupon];
        return true;
    }

    /// Halt the contribution period. Any attempt at contributing will fail.
    function halt() public only_admin only_during_period returns(bool success) {
        isHalted = true;
        Halted();
        return true;
    }

    /// Unhalt the contribution period.
    function unhalt() public only_admin only_during_halted_period returns(bool success) {
        isHalted = false;
        Unhalted();
        return true;
    }

    /// Kill this contract.
    function kill() public only_admin only_after_period {
        suicide(treasury);
    }
}
