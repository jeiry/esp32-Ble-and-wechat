// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    'deviceId':'',
    'serviceId':'',
    'characteristicId':''
  },
  onLoad() {
    this.bleInit();
  },
  bleInit() {
    console.log('searchBle')
    // 监听扫描到新设备事件
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach((device) => {
        // 这里可以做一些过滤
        console.log('Device Found', device)
        if(device.deviceId == "2E209DD5-18CD-C223-8403-A2A0C1AD89CA"){
          // 找到设备开始连接
          this.bleConnection(device.deviceId);
          wx.stopBluetoothDevicesDiscovery()
        }
      })
      // 找到要搜索的设备后，及时停止扫描
      // 
    })

    // 初始化蓝牙模块
    wx.openBluetoothAdapter({
      mode: 'central',
      success: (res) => {
        // 开始搜索附近的蓝牙外围设备
        wx.startBluetoothDevicesDiscovery({
          allowDuplicatesKey: false,
        })
      },
      fail: (res) => {
        if (res.errCode !== 10001) return
        wx.onBluetoothAdapterStateChange((res) => {
          if (!res.available) return
          // 开始搜寻附近的蓝牙外围设备
          wx.startBluetoothDevicesDiscovery({
            allowDuplicatesKey: false,
          })
        })
      }
    })
    var that = this
    wx.onBLECharacteristicValueChange((result) => {
      console.log('onBLECharacteristicValueChange',result.value)
      let hex = that.ab2hex(result.value)
      console.log('hextoString',that.hextoString(hex))
      console.log('hex',hex)
    })
  },
  bleConnection(deviceId){
    wx.createBLEConnection({
      deviceId, // 搜索到设备的 deviceId
      success: () => {
        // 连接成功，获取服务
        console.log('连接成功，获取服务')
        this.bleGetDeviceServices(deviceId)
      }
    })
  },
  bleGetDeviceServices(deviceId){
    wx.getBLEDeviceServices({
      deviceId, // 搜索到设备的 deviceId
      success: (res) => {
        console.log(res.services)
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            // 可根据具体业务需要，选择一个主服务进行通信
            this.bleGetDeviceCharacteristics(deviceId,res.services[i].uuid)
          }
        }
      }
    })
  },
  bleGetDeviceCharacteristics(deviceId,serviceId){
    wx.getBLEDeviceCharacteristics({
      deviceId, // 搜索到设备的 deviceId
      serviceId, // 上一步中找到的某个服务
      success: (res) => {
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          console.log(item)
          if (item.properties.write) { // 该特征值可写
            // 本示例是向蓝牙设备发送一个 0x00 的 16 进制数据
            // 实际使用时，应根据具体设备协议发送数据
            // let buffer = new ArrayBuffer(1)
            // let dataView = new DataView(buffer)
            // dataView.setUint8(0, 0)
            // let senddata = 'FF';
            // let buffer = this.hexString2ArrayBuffer(senddata);
            var buffer = this.stringToBytes("getid")
            this.setData({
              'deviceId':deviceId,
              'serviceId':serviceId,
              'characteristicId':item.uuid
            })
            wx.writeBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              value: buffer,
            })
          }
          if (item.properties.read) { // 改特征值可读
            wx.readBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
            })
          }
          if (item.properties.notify || item.properties.indicate) {
            // 必须先启用 wx.notifyBLECharacteristicValueChange 才能监听到设备 onBLECharacteristicValueChange 事件
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
            })
          }
        }
      }
    })
  },
  stringToBytes(str) {
    var array = new Uint8Array(str.length);
    for (var i = 0, l = str.length; i < l; i++) {
      array[i] = str.charCodeAt(i);
    }
    console.log(array);
    return array.buffer;
  },
  hextoString: function (hex) {
    var arr = hex.split("")
    var out = ""
    for (var i = 0; i < arr.length / 2; i++) {
      var tmp = "0x" + arr[i * 2] + arr[i * 2 + 1]
      var charValue = String.fromCharCode(tmp);
      out += charValue
    }
    return out
  },
  ab2hex(buffer) {
    var hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      function (bit) {
        return ('00' + bit.toString(16)).slice(-2)
      }
    )
    return hexArr.join('');
  },
  light1on(){
    var buffer = this.stringToBytes("light1on")
    wx.writeBLECharacteristicValue({
      deviceId:this.data.deviceId,
      serviceId:this.data.serviceId,
      characteristicId:this.data.characteristicId,
      value: buffer,
    })
  },
  light2on(){
    var buffer = this.stringToBytes("light2on")
    wx.writeBLECharacteristicValue({
      deviceId:this.data.deviceId,
      serviceId:this.data.serviceId,
      characteristicId:this.data.characteristicId,
      value: buffer,
    })
  },
  light1off(){
    var buffer = this.stringToBytes("light1off")
    wx.writeBLECharacteristicValue({
      deviceId:this.data.deviceId,
      serviceId:this.data.serviceId,
      characteristicId:this.data.characteristicId,
      value: buffer,
    })
  },
  light2off(){
    var buffer = this.stringToBytes("light2off")
    wx.writeBLECharacteristicValue({
      deviceId:this.data.deviceId,
      serviceId:this.data.serviceId,
      characteristicId:this.data.characteristicId,
      value: buffer,
    })
  },
  
})

