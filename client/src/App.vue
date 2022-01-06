<template>
  <v-app>
    <v-app-bar color="blue" app>
      <v-toolbar-title class="white--text">
        Chat
      </v-toolbar-title>
    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  data: () => ({
    //
  }),
};
</script>
