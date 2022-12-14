<template>

  <div class="row main-wrapper me-5">
    <div class="col-md-3" id="sidebar-container">
      <Sidebar />
    </div>
    <div class="col-md-9" style="padding: 20px;">
      <!-- Show this if user is not connected -->
      <div class="row ms-5" v-if="!isActivated">
        <div class="col-md-12 mb-3">
          <div class="container text-center">
            <h3><i class="bi bi-exclamation-triangle"></i> Not connected <i class="bi bi-exclamation-triangle"></i></h3>
            <p class="text-break">
              Please connect with your wallet to see your profile data.
            </p>
          </div>
        </div>
      </div>

      <!-- Address and balance -->
      <div class="row ms-5 card-white" v-if="isActivated">
        <div class="col-md-6 py-3 text-black mt-4 px-5">
          <div class="">
            <h3 class="fw-900">Address</h3>
            <p class="address-ballance fs-12">{{getUserAddress}}</p>
          </div>
          <div class="pt-2">
            <h3 class="fw-900">Balance</h3>
            <p class="balance fs-12">{{ getUserBalance }} {{this.getPaymentTokenName}}</p>
          </div>
        </div>

        <div class="col-md-6 d-flex align-items-center right">
          <div class="text-center ms-5">
           <div class="d-flex">
              <img src="../assets/vote.png" width="37" height="43" class="mb-2 me-4">
              <h1 class="vote">Vote Delegation</h1>
           </div>
           <p class="text-uppercase fs-12 text-gray">Delegate your ethics votes to a Satrap <br> party or Senator</p>
           <button class="btn coming-soon px-4">Coming soon</button>
          </div>
        </div>
      </div>

      <div class="row mt-5 ms-3">
        <div class="col-md-12">
          <div class="container">
            <h3 class="border-bottom d-inline-block">Your IDs:</h3>

            <table class="table table-hover mb-4">
              <tbody>
                <tr v-for="domainName in getUserAllDomainNames" :key="domainName">
                  <MyDomain :domain="domainName" />
                </tr>
              </tbody>
            </table>

            <p v-if="getUserSelectedNameData">
              <small><em>
                Don't see your ID here? 
                <span class="span-link" data-bs-toggle="modal" data-bs-target="#addDomainModal">
                  Add it manually</span>.
              </em></small>
            </p>
            <p v-else>
              No ID? No worries, <router-link to="/">claim one here!</router-link>
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>

  <!-- Add Domain Modal -->
  <div class="modal fade" id="addDomainModal" tabindex="-1" aria-labelledby="addDomainModalLabel" aria-hidden="true" modal-dialog-centered>
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="addDomainModalLabel">Add your existing ID</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="recipient-name" class="col-form-label">Enter your existing ID:</label>
            <input type="text" placeholder="Enter domain" class="form-control border-2" id="recipient-name" v-model="existingDomain">
            <small><em>No transaction will be made, this is a free query.</em></small>
          </div>
        </div>
        <div class="modal-footer">
          <button 
            type="button" 
            @click="addExistingDomain" 
            class="btn btn-secondary" 
            :disabled="domainNotValid">Add ID</button>

          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script lang="ts">
import { mapGetters, mapMutations } from 'vuex';
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { useToast, TYPE } from "vue-toastification";
import MyDomain from '../components/MyDomain.vue';
import Sidebar from '../components/Sidebar.vue';
import Referral from '../components/Referral.vue';
import tldAbi from '../abi/PunkTLD.json';
import useChainHelpers from "../hooks/useChainHelpers";

export default {
  name: "Profile",

  data() {
    return {
      existingDomain: null,
      loading: false
    }
  },

  components: {
    MyDomain,
    Referral,
    Sidebar
  },

  computed: {
    ...mapGetters("tld", ["getTldAddress", "getTldName"]),
    ...mapGetters("user", ["getUserAddress", "getPaymentTokenName", "getUserSelectedNameData", "getUserAllDomainNames", "getPaymentTokenAddress", "getPaymentTokenAllowance", "getUserBalance", "getPaymentTokenContract"]),

    customData() {
      if (this.getUserSelectedNameData) {
        try {
          return JSON.parse(this.getUserSelectedNameData.data);
        } catch {
          return null
        }
      }

      return null
    },

    domainNotValid() {
      if (this.existingDomain === "") {
        return true;
      } else if (this.existingDomain === null) {
        return true;
      } else if (this.existingDomain.split(".").length != 2) { // only 1 zero allowed (meaning there are two words after split)
        return true;
      } else if (this.existingDomain.includes(" ")) {
        return true;
      } else if (this.existingDomain.includes("%")) {
        return true;
      } else if (this.existingDomain.includes("&")) {
        return true;
      } else if (this.existingDomain.includes("?")) {
        return true;
      } else if (this.existingDomain.includes("#")) {
        return true;
      } else if (!this.existingDomain.includes(this.getTldName)) {
        return true;
      }
    }
  },

  methods: {
    ...mapMutations("user", ["addDomainManually"]),

    async addExistingDomain() {
      const existingDomainLower = this.existingDomain.toLowerCase();
      const existingDomainParts = existingDomainLower.split(".");
      const intfc = new ethers.utils.Interface(tldAbi);
      const contract = new ethers.Contract(this.getTldAddress, intfc, this.signer);
      const checkDomainHolder = await contract.getDomainHolder(existingDomainParts[0]);
      if (String(checkDomainHolder)===String(this.address)) {
        this.addDomainManually(existingDomainLower);
        this.toast("ID successfully added.", {type: TYPE.SUCCESS});
      } else {
        this.toast("This ID is not owned by your currently connected address.", {type: TYPE.ERROR});
      }
    },
  },

  setup() {
    const { address, isActivated, signer } = useEthers();
    const toast = useToast();
    const { getFallbackProvider } = useChainHelpers();

    return { address, getFallbackProvider, isActivated, signer, toast }
  },

}
</script>

<style scoped>
.clipboard {
  cursor: pointer
}

.blueish {
  background-color: #231e47;
  opacity: 0.75;
}

.table {
  --bs-table-bg: transparent;
  color: #fff;
  border-color: #fff;
}

.table:hover {
  --bs-table-bg: transparent;
  /*--bs-table-hover-bg: #1D1E2C;*/
  --bs-table-hover-bg: transparent;
  --bs-table-hover-color: none;
}

.fw-900 {
  font-weight: 900;
}

.right {
  background-color: rgb(30 29 71);
  border-top-left-radius: 155px;
  border-bottom-left-radius: 155px;
  color: #FFFFFF;;
}

.card-ad {
  /* background: rgba(255, 255, 255, 0.87); */
  /* box-shadow: 9px 7px 44px -10px rgba(251, 0, 0, 0.57); */
  /* border-radius: 20px; */
}

.vote {
  font-size: 36px;
}

.coming-soon {
  background: rgba(204, 51, 51, 0.8);
  border-radius: 16px;
  color: white;
}

.coming-soon:hover {
  color: white;
}

.balance {
  color: rgba(251, 0, 0, 0.57);
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}

.fs-12 {
  font-size: 12px;
  font-weight: 900;
}

.text-gray {
  color: gray;
}

.card-white {
  background: rgba(255, 255, 255, 0.7); 
  box-shadow: 9px 7px 44px -10px rgba(251, 0, 0, 0.57);
  border-radius: 20px;
}

@media only screen and (max-width: 768px) {
  .card-white {
    margin-left: 5px !important;
  }
  .vote {
    font-size: 25px;
  }
  .right > div {
    margin-left: 30px;
    margin-top: 20px;
    margin-bottom: 20px;
  }
  .main-wrapper {
    margin-right: 0px !important;
  }
}

</style>
