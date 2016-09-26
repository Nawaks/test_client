import * as SocketIOClient from 'socket.io-client'
import * as Delivery from 'delivery'
import * as fs from 'fs'
import * as Promise from 'bluebird'
import * as _ from 'lodash'

let files = ['sample-image.png', 'sample-image1.png']

function uploadNextFile(delivery) {
  let file = _.first(files)
  if (file) {
    delivery.send({
      name: file,
      path: './' + file
    })
  }
}

const socket = SocketIOClient('http://localhost:3001')

socket.on('connect', () => {
  console.log('Sockets connected')

  const delivery = Delivery.listen(socket)
  delivery.connect()

  delivery.on('delivery.connect', (delivery) => {
    delivery.on('receive.success', (fileUid) => {
      let file = delivery.sending[fileUid]
      if (!_.isUndefined(file) && _.includes(files, file.name)) {
        _.remove(files, (value) => file.name === value)
        console.log('File sent successfully!', fileUid)
        // socket.disconnect();
        if (_.isEmpty(files)) {
          console.log('Transfer complete!')
          socket.emit('transfer.complete')
          socket.disconnect()
        } else {
          uploadNextFile(delivery)
        }
      }
    })
    uploadNextFile(delivery)
  })
})

socket.on('event', (data) => {
  console.log('event', data)
})

socket.on('disconnect', () => {
  console.log('Sockets disconnected')
})
