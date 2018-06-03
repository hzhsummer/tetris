import { transform, i18n, lan } from '../../unit/const'
import { isMobile } from '../../unit'

import Nebulas from 'nebulas'
import NebPay from 'nebpay.js'
import _ from 'lodash'


var Neb = Nebulas.Neb
// var neb = new Neb(new Nebulas.HttpRequest('https://testnet.nebulas.io'))
var neb = new Neb(new Nebulas.HttpRequest('https://mainnet.nebulas.io'))
var api = neb.api

// 合约地址 test
// const dappAddress = 'n22J78th2oiX7eL8LS8hgE6n3msLvap3jzB'

// 合约地址 main
const dappAddress = 'n1y9rqm7po8cbPyXHrxGPybAfLoUqRcZgyC'


export default {
  name: 'Guide',
  data() {
    return {
      isMobile: isMobile(),

      dialogRankingInfoVisible: false,
      nickName: '',
      highestScore: 0, // 本地最高分
      chainScore: 0, // 链上存的分数
      gamerAddress: localStorage.getItem('gamerAddress') ? localStorage.getItem('gamerAddress') : '',
      rankingList: [], // 排行榜数据
      currentRow: null
    }
  },
  computed: {
    linkTitle: () => i18n.linkTitle[lan],
    github: () => i18n.github[lan],
    QRCode: () => i18n.QRCode[lan],
    QRTitle: () => i18n.QRNotice[lan],
    QRSrc: () =>
      window.location.protocol +
      '//hzhsummer.github.io/tetris/static/qr.jpeg'
  },
  mounted() {
    window.addEventListener('resize', this.resize.bind(this), true)

    // 取本地分数
    if (window.localStorage.getItem('VUE_TETRIS')) {
      this.highestScore = JSON.parse(decodeURIComponent(atob(window.localStorage.getItem('VUE_TETRIS')))).max;
    }
  },
  methods: {
    resize() {
      this.isMobile = isMobile()
    },
    inputNickName() {
      this.inquireChainScore()

      this.$prompt('请输入您的昵称', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputPattern: /\S/,
          inputErrorMessage: '昵称不能为空'
        }).then(({ value }) => {
          this.nickName = value
          // 上链
          this.toNasChain()
        }).catch(() => {

        });

      // this.$message({
      //   message: '请先安装星云钱包插件哦',
      //   type: 'warning'
      // });
    },
    showLoading() {
      this.loading = this.$loading({
        lock: true,
        text: '上链中... 请稍后查看',
        background: 'rgba(0, 0, 0, 0.8)'
      });
      setTimeout(() => {
        loading.close();
      }, 300000);
    },
    /*查询链上分数*/
    inquireChainScore () {
      var from = ''
      if (!this.gamerAddress) {
        from = 'n1MuZcKoAQEx4446rPYWeVb7zxPqskS4tcv'
      } else {
        from = this.gamerAddress
      }
      var value = '0'
      var nonce = '0'
      var gas_price = '1000000'
      var gas_limit = '2000000'

      // 获取排行榜列表
      var contract = {
          "function": "getGamerScore",
          "args": ""
      }

      neb.api.call(
        from,
        dappAddress,
        value,
        nonce,
        gas_price,
        gas_limit,
        contract
      ).then( (resp) => {
            if (resp["result"] !== "null") {

              this.chainScore = JSON.parse(resp["result"]).score
              console.log("当前用户链上分数", this.chainScore)

            } else {

            }
        }).catch(function (err) {

            console.log("error:" + err.message)
        })

    },
    /*显示排行榜*/
    showRanking () {
      this.dialogRankingInfoVisible = true

      var from = ''
      if (!this.gamerAddress) {
        from = 'n1MuZcKoAQEx4446rPYWeVb7zxPqskS4tcv'
      } else {
        from = this.gamerAddress
      }
      var value = '0'
      var nonce = '0'
      var gas_price = '1000000'
      var gas_limit = '2000000'

      // 获取排行榜列表
      var contract = {
          "function": "getRankingList",
          "args": ""
      }

      neb.api.call(
        from,
        dappAddress,
        value,
        nonce,
        gas_price,
        gas_limit,
        contract
      ).then( (resp) => {
            console.log("数据查询完成", resp)
            if (resp["result"] !== "null") {

              this.rankingList = JSON.parse(resp["result"]);
              // 安score进行排序
              if (this.rankingList.length) {
                this.rankingList = _.sortBy(this.rankingList, (obj, key) => {
                  return -obj.score
                })
              }

            } else {

            }
        }).catch(function (err) {

            console.log("error:" + err.message)
        })

    },
    // 上链
    toNasChain () {
      // 上链
      console.log('上链 score', this.highestScore);

      // 取本地分数
      if (window.localStorage.getItem('VUE_TETRIS')) {
        this.highestScore = JSON.parse(decodeURIComponent(atob(window.localStorage.getItem('VUE_TETRIS')))).max;
      }

      if (this.highestScore === 0) {
        this.$message({
          message: '当前分数为0不能上链哦！',
          type: 'warning'
        });
        return;
      }

      if(this.chainScore >= this.highestScore) {
        this.$message({
          message: '当前分数小于您已上链上的分数，继续努力哦！',
          type: 'warning'
        });
      } else {
        this.showLoading();

        // 链上保存分数
        var nebPay = new NebPay()

        var value = "0"
        var callFunction = "save"
        var callArgs =JSON.stringify([this.nickName, this.highestScore])
        console.log(callArgs)

        nebPay.call(
          dappAddress,
          value,
          callFunction,
          callArgs, {
            listener: this.cbResult
          }
        );

      }

    },
    /*上链执行回调*/
    cbResult (response) {
      console.log("response callback: " + JSON.stringify(response))

      if (JSON.stringify(response) === '"Error: Transaction rejected by user"') {

        if (this.loading) {
          this.loading.close();
        }

        this.$notify({
          title: '提示',
          message: '上链请求已被您拒绝！',
          type: 'error'
        });

        return;
      }

      var intervalQuery = setInterval(() => {
        api.getTransactionReceipt({hash: response["txhash"]}).then((receipt) => {
            console.log("上链中...", receipt)
            if (receipt.from) {
              this.gamerAddress = receipt.from;
              // 存在localStorage
              localStorage.setItem('gamerAddress', receipt.from);
            }
            // console.log(receipt)
            if (receipt["status"] === 2) {
                console.log("pending.....")
            } else if (receipt["status"] === 1){

                if (this.loading) {
                  this.loading.close();
                }

                this.$notify({
                  title: '上链成功',
                  message: '赶快点击排行榜查看排名吧',
                  type: 'success'
                })
                //清除定时器
                clearInterval(intervalQuery)
            }else {
                console.log("交易失败......")
                if (this.loading) {
                  this.loading.close();
                }

                this.$notify({
                  title: '上链失败',
                  message: '请重新再试',
                  type: 'warning'
                });


                //清除定时器
                clearInterval(intervalQuery)
            }
        });
      }, 3000);

    }
  }
}
