<template>
  <div>
    <v-dialog
      v-model="dialog"
      persistent
      max-width="600px"
    >
      <v-card>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col
                cols="12"
                sm="12"
                md="12"
              >
                <v-text-field
                  v-model="name"
                  label="Type your name"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue darken-1"
            text
            @click="dialog = false"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-container class="fill-height">
      <v-row class="fill-height pb-14" align="end">
        <v-col>
          <div
            v-for="(item, index) in chat"
            :key="index"
            :class="['d-flex flex-row align-center my-2', item.name == name ? 'justify-end': null]"
          >
            <span v-if="item.name == name" class="blue--text mr-3">{{ item.message }}</span>
            <v-avatar :color="item.name == name ? 'indigo': 'red'" size="36">
               <span class="white--text">{{ item.name[0] }}</span>
            </v-avatar>
            <span v-if="item.name != name" class="blue--text ml-3">{{ item.message }}</span>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <v-footer fixed>
      <v-container class="ma-0 pa-0">
        <v-row no-gutters>
          <v-col>
            <div class="d-flex flex-row align-center">
              <v-text-field v-model="message" placeholder="Type Something" @keypress.enter="send"></v-text-field>
              <v-btn icon class="ml-4" @click="send"><v-icon>mdi-send</v-icon></v-btn>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-footer>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',

  data: () => ({
    dialog: true,
    name: null,
    chat: [],
    message: null,
    websocketConnection: null
  }),

  mounted() {
    this.websocketConnection = new WebSocket('ws://localhost:4000/');
    this.websocketConnection.onmessage = (event) => {
      try {
        this.chat = JSON.parse(event.data);
      } catch (e) {
        this.chat = [];
      }
    };
  },

  methods: {
    send() {
      const chat = {
        name: this.name,
        message: this.message,
      };
      this.chat.push(chat);
      this.websocketConnection.send(JSON.stringify(chat));
      this.message = null;
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
