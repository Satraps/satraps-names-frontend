<template>
  <div class="row">
    <div class="col-md-3" id="sidebar-container">
      <Sidebar />
    </div>

    <div class="col-md-9">
      <TokenSender />
    </div>
  </div>
</template>

<script>
import TokenSender from "../components/TokenSender.vue";
import Sidebar from '../components/Sidebar.vue';

export default {
  name: "ProfileSendTokens",
  
  components: {
    TokenSender,
    Sidebar
  }
}
</script>