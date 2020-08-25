<template>
  <div id="app">
    <div id="appContent">
      <h1>
        UDT Info
        <!--
        <a href="https://github.com/lay2dev/simplestdapp" target="_blank">
          (Source
          Code)
        </a>
        -->
      </h1>
      <div style="text-align: center;">
        <h4>
          Forked from
          <a
            href="https://github.com/liusong1111/simplestdapp"
            target="_blank"
          >liusong's work</a>
        </h4>
        <h4>
          Again from
          <a
              href="https://github.com/lay2dev/simplestdapp"
              target="_blank"
          >lay2dev's work</a>
        </h4>
        <button @click.prevent="connectToSynapse()">Connect to synapse wallet</button>
      </div>
      <div class="cells">
        <input type="text" placeholder="UDT type script hash" v-model="searchUDTTypeHash"/>
        <button @click.prevent="searchInfo()">Search info</button>
        <h3>
          Symbol : {{ searchSymbol }}
        </h3>
        <h3>
          Decimal : {{ searchDecimal }}
        </h3>
        <h3>
          Name : {{ searchName }}
        </h3>
        <h3>
          Duplicated : {{ searchDuplicated }}
        </h3>

        <h3>
          Status : {{ getStatus }}
        </h3>

        <h3>
          UDT list (only which you're admin)
        </h3>
        <div>
          <div
            class="cell"
            v-for="udt in udts"
            :key="udt.typeHash"
          >
            <div class="cell-header">
              <h2>
                Type script hash : {{ udt.typeHash }}
              </h2>
              <h4>
                Balances : {{ udt.balances }}
              </h4>
              <div v-if="udt.duplicated !== undefined">
                <h5>
                  Symbol : {{ udt.symbol }}
                </h5>
                <h5>
                  Decimal : {{ udt.decimal }}
                </h5>
                <h5>
                  Name : {{ udt.name }}
                </h5>
                <h6 v-if="udt.duplicated">
                  {{ "more than 1 info exists" }}
                </h6>
              </div>
              <div v-if="udt.duplicated === undefined">
                <h3>
                  UDT Type script args: {{ udt.type.args }}
                </h3>
                <h3>
                  UDT Type script code hash: {{ udt.type.codeHash }}
                </h3>
                <h3>
                  UDT Type script hash type: {{ udt.type.hashType }}
                </h3>
                  <input type="text" placeholder="symbol" v-model="udt.symbol"/>
                  <input type="number" placeholder="decimal" v-model="udt.decimal"/>
                  <input type="text" placeholder="name" v-model="udt.name"/>
                <h3>
                  Make cell's lock script as your own (If not checked, make lock script common)
                </h3>
                  <input type="checkbox" v-model="udt.toOwnerOwn"/>
                <button @click.prevent="updateInfo(udt)">Submit info</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "App",
  data: function() {
    return {
      cells: [],
      udts: [],
      infos: [],
      currentLockScript: null,
      currentAddress: null,
      searchUDTTypeHash: null,
      searchSymbolData: null,
      searchDecimalData: null,
      searchNameData: null,
      searchDuplicatedData: null,
      status: null,
    };
  },
  components: {},
  mounted() {

  },
  computed: {
    searchSymbol() {
      return this.searchSymbolData;
    },
    searchDecimal() {
      return this.searchDecimalData;
    },
    searchName() {
      return this.searchNameData;
    },
    searchDuplicated() {
      return this.searchDuplicatedData;
    },
    getStatus() {
      return this.status;
    }
  },
  beforeDestroy() {

  },
  methods: {
    connectToSynapse: function() {
      let _self = this;
      this.$wallet.connectToSynapse(
          window.ckb
      ).then((result) => {
        _self.status = "Synapse wallet connected";
        _self.currentLockScript = result.lock;
        _self.currentAddress = result.address;
        console.log("connected to Synapse : ", result);
        _self.getCells();
      }).catch((error) => {
        _self.status = error;
        console.log(error);
      });
    },
    getCells: function () {
      let _self = this;
      this.$http.get("/api/get_cells", {
          params: this.currentLockScript
      }).then((response) => {
        _self.status = "got cells : " + response.data.length;
        console.log(response.data);
        _self.cells = response.data;
        _self.udts = _self.$cell.filterCellsUDT(
            response.data,
            _self.currentLockScript
        );

        let code_hash = [];
        let hash_type = [];

        let args = _self.udts.map((udt) => {
          code_hash.push(_self.$config.udtInfoCodeHash);
          hash_type.push("type");
          return udt.typeHash;
        });

        return _self.$http.get("/api/get_cells_with_type", {
          params: {
            args: args,
            code_hash: code_hash,
            hash_type: hash_type
          }
        });
      }).then((response) => {
        _self.status = "got info cells : " + response.data.length;
        console.log(response.data);
        _self.infos = response.data;

        _self.udts = _self.$cell.filterCellsUDTInfo(
            response.data,
            _self.udts
        );
      }).catch((error) => {
        _self.status = error;
        console.error(error);
      });
    },
    sendTx: function(udt) {
      let _self = this;

      this.$http.get("/api/get_udt_deps", {
        params: {
          args: udt.type.args,
          code_hash: udt.type.codeHash,
          hash_type: udt.type.hashType,
          tx_hash: udt.out_point.tx_hash,
          index: udt.out_point.index
        }
      }).then((udtDeps) => {
        _self.status = "got UDT deps : " + udtDeps.data;
        let tx = _self.$transaction.generateTx(
            _self.currentAddress,
            _self.cells,
            udt,
            udtDeps.data
        );
        return _self.$wallet.signSynapse(
            window.ckb,
            tx
        )
      }).then((signedTx) => {
        _self.status = "signed Tx";
        return _self.$http.post("/api/send_tx", {
          tx: JSON.stringify(_self.$transaction.changeFormat(signedTx.data.tx))
        })
      }).then((response) => {
        _self.status = "sent Tx : "+response.data;
        console.log(response);
      }).catch((error) => {
        _self.status = error;
        console.log(error);
      });
    },
    updateInfo: function (udt) {
      console.log(udt);
      this.sendTx(udt);
    },
    searchInfo: function () {
      let _self = this;
      let args = [];
      let code_hash = [];
      let hash_type = [];
      args.push(this.searchUDTTypeHash);
      code_hash.push(this.$config.udtInfoCodeHash);
      hash_type.push("type");
      this.$http.get("/api/get_cells_with_type", {
        params: {
          args,
          code_hash,
          hash_type
        }
      }).then((response) => {
        _self.status = "searching UDT info : "+response.data.length;
        if (response.data.length > 0) {
          let filteredData = _self.$cell.getUDTDataFromInfoCell(response.data[0].data);
          _self.searchSymbolData = filteredData.symbol;
          _self.searchDecimalData = filteredData.decimal;
          _self.searchNameData = filteredData.name;
          _self.searchDuplicatedData = response.data.length > 1;
        } else {
          _self.searchSymbolData = null;
          _self.searchDecimalData = null;
          _self.searchNameData = null;
          _self.searchDuplicatedData = null;
        }
      }).catch((error) => {
        _self.status = error;
        console.log(error);
      });
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
}

#appContent {
  width: 1000px;
  margin: auto;
}

h1,
h3 {
  text-align: center;
}

fieldset {
  display: table;
}

input {
  width: 100%;
}

.cell {
  margin: 8px;
  padding: 8px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
}

.cell-header {
  padding: 8px;
}

#model textarea {
  width: 100%;
  height: 10em;
}
</style>
