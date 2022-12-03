<template>
  <div class="text-center">
    <div class="text-primary-600 text-9xl font-bold my-5">404</div>
    <div class="text-2xl text-gray-500 my-5">Oops. Page not found...</div>

    <!--
    <div class="container text-center">
      <img class="img-fluid main-img rounded logo" width="250" src="../assets/logo.png" />

      <p class="punchline">
        Satraps Names
      </p>
    </div>
    -->

    <div class="flex flex-row justify-center space-x-4">
      <button @click="this.$router.go(-1)" class="btn btn-primary my-5 mx-2">Back</button>
      <button @click="this.$router.push({name: 'Home'})" class="btn btn-primary my-5">Home</button>
    </div>
  </div>
</template>

<style scoped>
.punchline {
  font-size: 3em;
  margin-top: 10px;
  margin-bottom: 250px;
}
.logo {
  margin-top: 300px;
}
</style>