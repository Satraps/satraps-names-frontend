<template>
<div class="container">
  <h1 class="text-center">Admin</h1>
  
  <div class="row mt-3 text-center">
    <div class="col-md-8 offset-md-2">

      <!-- Minter: togglePaused -->
      <div v-if="isUserMinterAdmin">
        <h3 v-if="getMinterPaused">Unpause the minting contract</h3>
        <h3 v-if="!getMinterPaused">Pause the minting contract</h3>

        <button 
          v-if="isActivated" 
          class="btn btn-primary btn-lg mt-3" 
          @click="togglePaused" 
          :disabled="waitingPaused"
        >
          <span v-if="waitingPaused" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span v-if="getMinterPaused">Unpause</span>
          <span v-if="!getMinterPaused">Pause</span>
        </button>

        <hr />
      </div>
      <!-- END Minter: togglePaused -->

      <!-- Minter: changeDiscountBps -->
      <div v-if="isUserMinterAdmin">
        <h3>Change Discount Bips (basis points)</h3>

        <p>Important: Discount is defined in basis points (bps). Current: {{getMinterDiscountPercentage*100}} bps ({{getMinterDiscountPercentage}}%).</p>

        <div class="row mt-5">
          <div class="col-md-6 offset-md-3">
            <input 
              v-model="newDiscountBps"
              class="form-control text-center border-2 border-light"
              placeholder="Enter a new discount in bps"
            >
          </div>
        </div>

        <button 
          v-if="isActivated" 
          class="btn btn-primary btn-lg mt-3" 
          @click="changeDiscountBps" 
          :disabled="waitingDbps"
        >
          <span v-if="waitingDbps" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span>Change discount</span>
        </button>

        <hr />
      </div>
      <!-- END Minter: changeDiscountBps -->

      <!-- Minter: addPartnerNftAddress -->
      <div v-if="isUserMinterAdmin">
        <h3>Minter contract: add partner NFT collection</h3>

        <p>Anyone who holds an NFT from the partner collection will be able to mint a domain and also receive a discount.</p>

        <p>
          Current partner NFT addresses: {{currentNftPartners}}
        </p>

        <div class="row mt-5">
          <div class="col-md-6 offset-md-3">
            <input 
              v-model="newPartnerAddress"
              class="form-control text-center border-2 border-light"
              placeholder="Enter a new partner address"
            >
          </div>
        </div>

        <button 
          v-if="isActivated" 
          class="btn btn-primary btn-lg mt-3" 
          @click="addPartnerNftAddress" 
          :disabled="waitingApa"
        >
          <span v-if="waitingApa" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span>Add new partner</span>
        </button>

        <hr />
      </div>
      <!-- END Minter: addPartnerNftAddress -->

      <!-- Minter: removePartnerNftAddress -->
      <div v-if="isUserMinterAdmin">
        <h3>Minter contract: remove partner NFT collection</h3>

        <p>
          IMPORTANT: To remove a partner enter their order number in the partners list. The first partner has an order 
          number 0, the second has 1 and so on.
        </p>

        <p>
          Current partner NFT addresses list: {{currentNftPartners}}
        </p>

        <div class="row mt-5">
          <div class="col-md-6 offset-md-3">
            <input 
              v-model="removePartnerIndex"
              class="form-control text-center border-2 border-light"
              placeholder="Enter the partner order number"
            >
          </div>
        </div>

        <button 
          v-if="isActivated" 
          class="btn btn-primary btn-lg mt-3" 
          @click="removePartnerNftAddress" 
          :disabled="waitingRpa"
        >
          <span v-if="waitingRpa" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span>Remove a partner</span>
        </button>

        <hr />
      </div>
      <!-- END Minter: removePartnerNftAddress -->

      <!-- Minter: changeReferralFee -->
      <div v-if="isUserMinterAdmin">
        <h3>Change referral fee</h3>

        <p>Important: Referral fees are defined in basis points (bps). Current: {{getReferralFee}} bps ({{getReferralFee/100}}%).</p>

        <div class="row mt-5">
          <div class="col-md-6 offset-md-3">
            <input 
              v-model="newReferralFee"
              class="form-control text-center border-2 border-light"
              placeholder="Enter a new referral fee"
            >
          </div>
        </div>

        <button 
          v-if="isActivated" 
          class="btn btn-primary btn-lg mt-3" 
          @click="changeReferralFee" 
          :disabled="waitingRf"
        >
          <span v-if="waitingRf" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span>Change referral fee</span>
        </button>

        <hr />
      </div>
      <!-- END Minter: changeReferralFee -->

      <!-- Minter: changePrice - 1char -->
      <div v-if="isUserMinterAdmin">
        <h3>Change price (1 char domains)</h3>

        <p>Current price: {{getMinterTldPrice1}} ETH</p>

        <div class="row mt-5">
          <div class="col-md-6 offset-md-3">
            <input 
              v-model="newPrice1"
              class="form-control text-center border-2 border-light"
              placeholder="Enter the new price for 1 char domains"
            >
          </div>
        </div>

        <button 
          v-if="isActivated" 
          class="btn btn-primary btn-lg mt-3" 
          @click="changePrice(1)" 
          :disabled="waitingPrice1"
        >
          <span v-if="waitingPrice1" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span>Change price (1 char)</span>
        </button>

        <hr />
      </div>
      <!-- END Minter: changePrice - 1char -->

      <!-- Minter: changePrice - 2char -->
      <div v-if="isUserMinterAdmin">
        <h3>Change price (2 char domains)</h3>

        <p>Current price: {{getMinterTldPrice2}} ETH</p>

        <div class="row mt-5">
          <div class="col-md-6 offset-md-3">
            <input 
              v-model="newPrice2"
              class="form-control text-center border-2 border-light"
              placeholder="Enter the new price for 2 char domains"
            >
          </div>
        </div>

        <button 
          v-if="isActivated" 
          class="btn btn-primary btn-lg mt-3" 
          @click="changePrice(2)" 
          :disabled="waitingPrice2"
        >
          <span v-if="waitingPrice2" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span>Change price (2 chars)</span>
        </button>

        <hr />
      </div>
      <!-- END Minter: changePrice - 2char -->

      <!-- Minter: changePrice - 3char -->
      <div v-if="isUserMinterAdmin">
        <h3>Change price (3 char domains)</h3>

        <p>Current price: {{getMinterTldPrice3}} ETH</p>

        <div class="row mt-5">
          <div class="col-md-6 offset-md-3">
            <input 
              v-model="newPrice3"
              class="form-control text-center border-2 border-light"
              placeholder="Enter the new price for 3 char domains"
            >
          </div>
        </div>

        <button 
          v-if="isActivated" 
          class="btn btn-primary btn-lg mt-3" 
          @click="changePrice(3)" 
          :disabled="waitingPrice3"
        >
          <span v-if="waitingPrice3" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span>Change price (3 chars)</span>
        </button>

        <hr />
      </div>
      <!-- END Minter: changePrice - 3char -->

      <!-- Minter: changePrice - 4char -->
      <div v-if="isUserMinterAdmin">
        <h3>Change price (4 char domains)</h3>

        <p>Current price: {{getMinterTldPrice4}} ETH</p>

        <div class="row mt-5">
          <div class="col-md-6 offset-md-3">
            <input 
              v-model="newPrice4"
              class="form-control text-center border-2 border-light"
              placeholder="Enter the new price for 4 char domains"
            >
          </div>
        </div>

        <button 
          v-if="isActivated" 
          class="btn btn-primary btn-lg mt-3" 
          @click="changePrice(4)" 
          :disabled="waitingPrice4"
        >
          <span v-if="waitingPrice4" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span>Change price (4 chars)</span>
        </button>

        <hr />
      </div>
      <!-- END Minter: changePrice - 4char -->

      <!-- Minter: changePrice - 5char -->
      <div v-if="isUserMinterAdmin">
        <h3>Change price (5+ char domains)</h3>

        <p>Current price: {{getMinterTldPrice5}} ETH</p>

        <div class="row mt-5">
          <div class="col-md-6 offset-md-3">
            <input 
              v-model="newPrice5"
              class="form-control text-center border-2 border-light"
              placeholder="Enter the new price for 5+ char domains"
            >
          </div>
        </div>

        <button 
          v-if="isActivated" 
          class="btn btn-primary btn-lg mt-3" 
          @click="changePrice(5)" 
          :disabled="waitingPrice5"
        >
          <span v-if="waitingPrice5" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span>Change price (5+ chars)</span>
        </button>

        <hr />
      </div>
      <!-- END Minter: changePrice - 5char -->

      <!-- TLD: change metadata address -->
      <div v-if="isUserTldAdmin">
        <h3>TLD contract: change metadata address</h3>

        <p>Change the Metadata contract address in the TLD contract.</p>

        <div class="row mt-5">
          <div class="col-md-6 offset-md-3">
            <input 
              v-model="newMetadataAddress"
              class="form-control text-center border-2 border-light"
              placeholder="Enter the new metadata address"
            >
          </div>
        </div>

        <button 
          v-if="isActivated" 
          class="btn btn-primary btn-lg mt-3" 
          @click="changeMetadataAddress" 
          :disabled="waitingCma"
        >
          <span v-if="waitingCma" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span>Change metadata address</span>
        </button>

        <hr />
      </div>
      <!-- END TLD: change metadata address -->

      <!-- TLD: change minter address -->
      <div v-if="isUserTldAdmin">
        <h3>TLD contract: change minter address</h3>

        <p>Change the Minter contract address in the TLD contract.</p>

        <div class="row mt-5">
          <div class="col-md-6 offset-md-3">
            <input 
              v-model="newMinterAddress"
              class="form-control text-center border-2 border-light"
              placeholder="Enter the new minter address"
            >
          </div>
        </div>

        <button 
          v-if="isActivated" 
          class="btn btn-primary btn-lg mt-3" 
          @click="changeMinterAddress" 
          :disabled="waitingCmia"
        >
          <span v-if="waitingCmia" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span>Change minter address</span>
        </button>

        <hr />
      </div>
      <!-- END TLD: change minter address -->

      <!-- Minter: transferOwnership -->
      <div v-if="isUserMinterAdmin">
        <h3>Minter contract: transfer ownership</h3>

        <p>Transfer ownership of the minter contract to another address.</p>

        <div class="row mt-5">
          <div class="col-md-6 offset-md-3">
            <input 
              v-model="newMinterOwner"
              class="form-control text-center border-2 border-light"
              placeholder="Enter a new owner address"
            >
          </div>
        </div>

        <button 
          v-if="isActivated" 
          class="btn btn-primary btn-lg mt-3" 
          @click="transferMinterOwnership" 
          :disabled="waitingTmo"
        >
          <span v-if="waitingTmo" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span>Transfer minter ownership</span>
        </button>

        <hr />
      </div>
      <!-- END Minter: transferOwnership -->

      <!-- TLD: transferOwnership -->
      <div v-if="isUserTldAdmin">
        <h3>TLD contract: transfer ownership</h3>

        <p>Transfer ownership of the TLD contract to another address.</p>

        <div class="row mt-5">
          <div class="col-md-6 offset-md-3">
            <input 
              v-model="newTldOwner"
              class="form-control text-center border-2 border-light"
              placeholder="Enter a new owner address"
            >
          </div>
        </div>

        <button 
          v-if="isActivated" 
          class="btn btn-primary btn-lg mt-3" 
          @click="transferTldOwnership" 
          :disabled="waitingTdo"
        >
          <span v-if="waitingTdo" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span>Transfer TLD ownership</span>
        </button>

        <hr />
      </div>
      <!-- END TLD: transferOwnership -->

      <!-- Minter: ownerFreeMint -->
      <div v-if="isUserMinterAdmin">
        <h3>Minter contract: mint a domain for free</h3>

        <p>The owner of the Minter contract can mint a domain for free.</p>

        <div class="row mt-5">
          <div class="col-md-6 offset-md-3">
            <input 
              v-model="newDomain"
              class="form-control text-center border-2 border-light"
              placeholder="Enter a domain name (without extension)"
            >
          </div>
        </div>

        <p class="error" v-if="buyNotValid(newDomain).invalid">
          <small>
            <em>{{ buyNotValid(newDomain).message }}</em>
          </small>
        </p>

        <div class="row mt-2">
          <div class="col-md-6 offset-md-3">
            <input 
              v-model="newDomainOwner"
              class="form-control text-center border-2 border-light"
              placeholder="Enter a new owner address"
            >
          </div>
        </div>

        <button 
          v-if="isActivated" 
          class="btn btn-primary btn-lg mt-3" 
          @click="mintFreeDomain" 
          :disabled="waitingMfd || buyNotValid(newDomain).invalid"
        >
          <span v-if="waitingMfd" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span>Mint a free domain</span>
        </button>

        <hr />
      </div>
      <!-- END Minter: ownerFreeMint -->

    </div>
  </div>
</div>
</template>

<script lang="ts">
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { mapActions, mapGetters } from 'vuex';
import { useToast, TYPE } from "vue-toastification";
import WaitingToast from "../components/toasts/WaitingToast.vue";
import MinterAbi from "../abi/Minter.json";
import useDomainHelpers from "../hooks/useDomainHelpers";

export default {
  name: "Admin",

  data() {
    return {
      currentNftPartners: [],
      newDiscountBps: null,
      newDomain: null,
      newDomainOwner: null,
      newMetadataAddress: null,
      newMinterAddress: null,
      newMinterOwner: null,
      newPartnerAddress: null,
      newTldOwner: null,
      newPrice1: null,
      newPrice2: null,
      newPrice3: null,
      newPrice4: null,
      newPrice5: null,
      newReferralFee: null,
      removePartnerIndex: null,
      waitingApa: false, // waiting for TX to complete
      waitingCma: false, // waiting for TX to complete
      waitingCmia: false, // waiting for TX to complete
      waitingDbps: false, // waiting for TX to complete
      waitingMfd: false, // waiting for TX to complete
      waitingPaused: false, // waiting for TX to complete
      waitingPrice1: false, // waiting for TX to complete
      waitingPrice2: false, // waiting for TX to complete
      waitingPrice3: false, // waiting for TX to complete
      waitingPrice4: false, // waiting for TX to complete
      waitingPrice5: false, // waiting for TX to complete
      waitingRf: false, // waiting for TX to complete
      waitingRpa: false, // waiting for TX to complete
      waitingTmo: false, // waiting for TX to complete
      waitingTdo: false, // waiting for TX to complete
    }
  },

  created() {
    this.fetchData();
  },

  computed: {
    ...mapGetters("punk", ["getTldAbi"]),
    ...mapGetters("network", ["getBlockExplorerBaseUrl"]),
    ...mapGetters("user", ["isUserMinterAdmin", "isUserTldAdmin", "isUserRoyaltyFeeUpdater"]),
    ...mapGetters("tld", ["getMinterAddress", "getReferralFee", "getTldAddress", "getMinterDiscountPercentage", "getMinterPaused", "getMinterTldPrice1", "getMinterTldPrice2", "getMinterTldPrice3", "getMinterTldPrice4", "getMinterTldPrice5"]),
  },

  methods: {
    ...mapActions("tld", ["fetchMinterContractData"]),

    async addPartnerNftAddress() {
      this.waitingApa = true;

      // minter contract (with signer)
      const minterIntfc = new ethers.utils.Interface(MinterAbi);
      const minterContractSigner = new ethers.Contract(this.getMinterAddress, minterIntfc, this.signer);

      try {
        const tx = await minterContractSigner.addPartnerNftAddress(this.newPartnerAddress);

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: TYPE.INFO,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have added a new partner!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.fetchData();
          this.waitingApa = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          this.waitingApa = false;
        }

      } catch (e) {
        console.log(e)
        this.waitingApa = false;
        this.toast(e.message, {type: TYPE.ERROR});
      }

      this.waitingApa = false;
    },

    async changeDiscountBps() {
      this.waitingDbps = true;

      // minter contract (with signer)
      const minterIntfc = new ethers.utils.Interface(MinterAbi);
      const minterContractSigner = new ethers.Contract(this.getMinterAddress, minterIntfc, this.signer);

      try {
        const tx = await minterContractSigner.changeDiscountBps(Number(this.newDiscountBps));

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: TYPE.INFO,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have changed the discount!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.waitingDbps = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          this.waitingDbps = false;
        }

      } catch (e) {
        console.log(e)
        this.waitingDbps = false;
        this.toast(e.message, {type: TYPE.ERROR});
      }

      this.waitingDbps = false;
    },

    async changeMetadataAddress() {
      this.waitingCma = true;

      // minter contract (with signer)
      const tldIntfc = new ethers.utils.Interface(this.getTldAbi);
      const tldContractSigner = new ethers.Contract(this.getTldAddress, tldIntfc, this.signer);

      try {
        const tx = await tldContractSigner.changeMetadataAddress(this.newMetadataAddress);

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: TYPE.INFO,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have changed the metadata address!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.waitingCma = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          this.waitingCma = false;
        }

      } catch (e) {
        console.log(e)
        this.waitingCma = false;
        this.toast(e.message, {type: TYPE.ERROR});
      }

      this.waitingCma = false;
    },

    async changeMinterAddress() {
      this.waitingCmia = true;

      // minter contract (with signer)
      const tldIntfc = new ethers.utils.Interface(this.getTldAbi);
      const tldContractSigner = new ethers.Contract(this.getTldAddress, tldIntfc, this.signer);

      try {
        const tx = await tldContractSigner.changeMinter(this.newMinterAddress);

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: TYPE.INFO,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have changed the minter address!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.waitingCmia = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          this.waitingCmia = false;
        }

      } catch (e) {
        console.log(e)
        this.waitingCmia = false;
        this.toast(e.message, {type: TYPE.ERROR});
      }

      this.waitingCmia = false;
    },

    async changePrice(chars) {
      let newPrice;

      switch(chars) {
        case 1:
          this.waitingPrice1 = true;
          newPrice = this.newPrice1;
          break;
        case 2:
          this.waitingPrice2 = true;
          newPrice = this.newPrice2;
          break;
        case 3:
          this.waitingPrice3 = true;
          newPrice = this.newPrice3;
          break;
        case 4:
          this.waitingPrice4 = true;
          newPrice = this.newPrice4;
          break;
        case 5:
          this.waitingPrice5 = true;
          newPrice = this.newPrice5;
          break;
      }

      // convert price to wei
      const newPriceWei = ethers.utils.parseUnits(newPrice, 18);

      // minter contract (with signer)
      const minterIntfc = new ethers.utils.Interface(MinterAbi);
      const minterContractSigner = new ethers.Contract(this.getMinterAddress, minterIntfc, this.signer);

      try {
        const tx = await minterContractSigner.changePrice(newPriceWei, Number(chars));

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: TYPE.INFO,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have changed price!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.fetchMinterContractData();
          switch(chars) {
            case 1:
              this.waitingPrice1 = false;
              break;
            case 2:
              this.waitingPrice2 = false;
              break;
            case 3:
              this.waitingPrice3 = false;
              break;
            case 4:
              this.waitingPrice4 = false;
              break;
            case 5:
              this.waitingPrice5 = false;
              break;
          }
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          switch(chars) {
            case 1:
              this.waitingPrice1 = false;
              break;
            case 2:
              this.waitingPrice2 = false;
              break;
            case 3:
              this.waitingPrice3 = false;
              break;
            case 4:
              this.waitingPrice4 = false;
              break;
            case 5:
              this.waitingPrice5 = false;
              break;
          }
        }

      } catch (e) {
        console.log(e)
        switch(chars) {
          case 1:
            this.waitingPrice1 = false;
            break;
          case 2:
            this.waitingPrice2 = false;
            break;
          case 3:
            this.waitingPrice3 = false;
            break;
          case 4:
            this.waitingPrice4 = false;
            break;
          case 5:
            this.waitingPrice5 = false;
            break;
        }
        this.toast(e.message, {type: TYPE.ERROR});
      }

      switch(chars) {
        case 1:
          this.waitingPrice1 = false;
          break;
        case 2:
          this.waitingPrice2 = false;
          break;
        case 3:
          this.waitingPrice3 = false;
          break;
        case 4:
          this.waitingPrice4 = false;
          break;
        case 5:
          this.waitingPrice5 = false;
          break;
      }
    },

    async changeReferralFee() {
      this.waitingRf = true;

      // minter contract (with signer)
      const minterIntfc = new ethers.utils.Interface(MinterAbi);
      const minterContractSigner = new ethers.Contract(this.getMinterAddress, minterIntfc, this.signer);

      try {
        const tx = await minterContractSigner.changeReferralFee(Number(this.newReferralFee));

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: TYPE.INFO,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have changed the referral fee!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.waitingRf = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          this.waitingRf = false;
        }

      } catch (e) {
        console.log(e)
        this.waitingRf = false;
        this.toast(e.message, {type: TYPE.ERROR});
      }

      this.waitingRf = false;
    },

    async fetchData() {
      // minter contract (with signer)
      const minterIntfc = new ethers.utils.Interface(MinterAbi);
      const minterContractSigner = new ethers.Contract(this.getMinterAddress, minterIntfc, this.signer);

      // get partner NFT addresses
      this.currentNftPartners = await minterContractSigner.getPartnerNftsArray();
    },

    async mintFreeDomain() {
      this.waitingMfd = true;
      const lowerCaseDomain = String(this.newDomain).toLowerCase();
      // check if domain already minted
      const tldIntfc = new ethers.utils.Interface(this.getTldAbi);
      const tldContractSigner = new ethers.Contract(this.getTldAddress, tldIntfc, this.signer);
      const existingHolder = await tldContractSigner.getDomainHolder(lowerCaseDomain);
      if (existingHolder !== ethers.constants.AddressZero) {
        this.toast("Sorry, but this domain name is already taken...", {type: TYPE.ERROR});
        this.waitingMfd = false;
        return;
      }
      // minter contract (with signer)
      const minterIntfc = new ethers.utils.Interface(MinterAbi);
      const minterContractSigner = new ethers.Contract(this.getMinterAddress, minterIntfc, this.signer);
      try {
        const tx = await minterContractSigner.ownerFreeMint(
          lowerCaseDomain,
          this.newDomainOwner
        );
        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: TYPE.INFO,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );
        const receipt = await tx.wait();
        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have successfully minted a new domain!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.waitingMfd = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          this.waitingMfd = false;
        }
      } catch (e) {
        console.log(e)
        this.waitingMfd = false;
        this.toast(e.message, {type: TYPE.ERROR});
      }
      this.waitingMfd = false;
    },

    async removePartnerNftAddress() {
      this.waitingRpa = true;

      // minter contract (with signer)
      const minterIntfc = new ethers.utils.Interface(MinterAbi);
      const minterContractSigner = new ethers.Contract(this.getMinterAddress, minterIntfc, this.signer);

      try {
        const tx = await minterContractSigner.removePartnerNftAddress(this.removePartnerIndex);

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: TYPE.INFO,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have removed a partner!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.fetchData();
          this.waitingRpa = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          this.waitingRpa = false;
        }

      } catch (e) {
        console.log(e)
        this.waitingRpa = false;
        this.toast(e.message, {type: TYPE.ERROR});
      }

      this.waitingRpa = false;
    },

    async togglePaused() {
      this.waitingPaused = true;

      // minter contract (with signer)
      const minterIntfc = new ethers.utils.Interface(MinterAbi);
      const minterContractSigner = new ethers.Contract(this.getMinterAddress, minterIntfc, this.signer);

      try {
        const tx = await minterContractSigner.togglePaused();

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: TYPE.INFO,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have un/paused the minter contract!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.fetchMinterContractData();
          this.waitingPaused = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          this.waitingPaused = false;
        }

      } catch (e) {
        console.log(e)
        this.waitingPaused = false;
        this.toast(e.message, {type: TYPE.ERROR});
      }

      this.waitingPaused = false;
    },

    async transferMinterOwnership() {
      this.waitingTmo = true;

      // minter contract (with signer)
      const minterIntfc = new ethers.utils.Interface(MinterAbi);
      const minterContractSigner = new ethers.Contract(this.getMinterAddress, minterIntfc, this.signer);

      try {
        const tx = await minterContractSigner.transferOwnership(this.newMinterOwner);

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: TYPE.INFO,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have transferred ownership!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.waitingTmo = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          this.waitingTmo = false;
        }

      } catch (e) {
        console.log(e)
        this.waitingTmo = false;
        this.toast(e.message, {type: TYPE.ERROR});
      }

      this.waitingTmo = false;
    },

    async transferTldOwnership() {
      this.waitingTdo = true;

      // minter contract (with signer)
      const tldIntfc = new ethers.utils.Interface(this.getTldAbi);
      const tldContractSigner = new ethers.Contract(this.getTldAddress, tldIntfc, this.signer);

      try {
        const tx = await tldContractSigner.transferOwnership(this.newTldOwner);

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: TYPE.INFO,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have transferred ownership!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.waitingTdo = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          this.waitingTdo = false;
        }

      } catch (e) {
        console.log(e)
        this.waitingTdo = false;
        this.toast(e.message, {type: TYPE.ERROR});
      }

      this.waitingTdo = false;
    },

  },

  setup() {
    const { address, isActivated, signer } = useEthers();
    const toast = useToast();
    const { buyNotValid } = useDomainHelpers();

    return { address, buyNotValid, isActivated, signer, toast }
  }
}
</script>

<style scoped>
p {
  font-size: 1.1em;
}

h3 {
  margin-top: 35px;
}
</style>