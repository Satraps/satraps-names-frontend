<template>
  <div class="row">
    <div class="col-md-3" id="sidebar-container">
      <Sidebar />
    </div>

    <div class="col-md-9">
      <DelegateFtso />
    </div>
  </div>
</template>

<script>
import DelegateFtso from "../components/DelegateFtso.vue";
import Sidebar from '../components/Sidebar.vue';

export default {
  name: "ProfileDelegateFtso",
  
  components: {
    DelegateFtso,
    Sidebar
  }
}
</script>