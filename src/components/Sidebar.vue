<template>
  <div class="container">

    <!-- Flip profile images -->
      <!-- Custom image (TODO: update this one, custom-img-container and custom-img-content) -->
      <transition name="flip">
        <div v-if="flipSide=='front'" @click="flipImage" class="img-thumbnail custom-img-container">
          <div class="custom-img-content">
            <div><span>{{getNameOrAddress}}</span></div>
          </div>
        </div>
      </transition> 
      <!-- END Custom image -->

      <!-- Punk Domain image -->
      <transition name="flip">
        <img v-if="flipSide=='back'" @click="flipImage" :src="getUserImage" class="img-fluid img-thumbnail">
      </transition>
      <!-- END Punk Domain image -->

      <div class="text-center" @click="flipImage">
        <small><i class="bi bi-arrow-repeat"></i></small>
      </div>
    <!-- END Flip profile images -->
    
    <hr />

    <router-link class="btn btn-sidebar text-start" to="/profile">
      <img src="../assets/person.png" class="side-img">Profile
    </router-link>

    <router-link v-if="getFreeMintEligible" class="btn btn-sidebar text-start" to="/profile/claim-free-domain">
      <img src="../assets/heart.png" class="side-img">Claim free ID
    </router-link>

    <router-link class="btn btn-sidebar text-start" to="/profile/buy-domain">
      <i class="bi bi-cart4"></i> Buy ID
    </router-link>

    <!--
    <router-link class="btn btn-sidebar text-start" to="/profile/delegate-ftso">
      <i class="bi bi-arrow-bar-right"></i> Delegate to FTSO
    </router-link>
    -->

    <router-link class="btn btn-sidebar text-start" to="/profile/search-domain">
      <img src="../assets/search.png" class="side-img">Search 
    </router-link>

    <router-link class="btn btn-sidebar text-start" to="/profile/send-tokens">
      <img src="../assets/send.png" class="side-img">Send tokens
    </router-link>

    <!--
    <router-link class="btn btn-sidebar text-start" to="/browser">
      <i class="bi bi-window-plus"></i> Browser extension
    </router-link>

     <router-link class="btn btn-sidebar text-start" to="/allowance">
      <i class="bi bi-currency-dollar"></i> ${{getPaymentTokenName}} allowance
    </router-link> 
    -->

  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: "Sidebar",

  data() {
    return {
      flipSide: "back", // front-custom, back-punk
    }
  },

  created() {
    const storedFlipSide = localStorage.getItem("flipSide");

    if (storedFlipSide === "front" || storedFlipSide === "back") {
      this.flipSide = storedFlipSide;
    }
  },

  computed: {
    ...mapGetters("user", ["getFreeMintEligible", "getUserSelectedName", "getPaymentTokenName", "getUserShortAddress", "getUserSelectedNameImageSvg"]),

    getNameOrAddress() {
      if (this.getUserSelectedName) {
        return this.getUserSelectedName;
      } else {
        return this.getUserShortAddress;
      }
    },

    getUserImage() {
      if (this.getUserSelectedNameImageSvg) {
        return this.getUserSelectedNameImageSvg;
      } else {
        return "https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg"
      }
      
    }
  },

  methods: {
    flipImage() {
      if (this.flipSide === "front") {
        this.flipSide = "back";
        localStorage.setItem("flipSide", "back");
      } else {
        this.flipSide = "front";
        localStorage.setItem("flipSide", "front");
      }
    }
  }
}
</script>

<style scoped>
.bi {
  margin-right: 5px;
}

.btn-sidebar, .btn-sidebar:focus {
  padding: 10px;
  width: 100%;
  color: #fff;
  text-decoration: none;
  box-shadow: none;
}

.btn-sidebar:hover {
  color: #fff;
  border-color: #fff;
  border-radius: 10px;
}

.custom-img-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: transparent;
}

.custom-img-container:before{
  content: "";
  display: block;
  padding-top: 100%;
  border: 2px solid white;
  border-radius: 10px;
}

.custom-img-content {
  position:  absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.custom-img-content div {
  display: table;
  width: 100%;
  height: 100%;
}

.custom-img-content span {
  display: table-cell;
  text-align: center;
  vertical-align: middle;
  color: white;
}

.flip-enter-active {
  transition: all 0.4s ease;
}

.flip-leave-active {
  display: none;
}

.flip-enter-from, .flip-leave-from {
  transform: rotateY(180deg);
  opacity: 0;
}

.img-thumbnail {
  border-color: transparent;
  border-radius: 15px;
  cursor: pointer;
}

.side-img {
  width: 23px;
  margin-right: 12px;
  height: 23px;
}

.sidebar {
  background: rgba(158, 8, 8, 0.2);
  border-right: 5px solid rgba(65, 7, 7, 0.8);
  border-radius: inherit;
}
</style>
