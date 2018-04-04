self.importScripts('fuse.js');



function generateWebworker (webWorkerId = 'noName') {
  const _Fuse = Fuse

  let searchList = []

  let port

  self.addEventListener('message', function(e) {

    if(e.data.port) {
      port = e.ports[0]

      port.onmessage = function (e) {

        if(e.data.searchList) {
          searchList = e.data.searchList
        }

        if(e.data.searchingFor) {

          const searchingFor = e.data.searchingFor

          const engine = new _Fuse(searchList, e.data.searchOptions)

          const result = engine.search(searchingFor)

          const message = {searchResult: result, searchingFor: searchingFor, wwId: webWorkerId}

          port.postMessage(message)
        }
      }
    }
  })
}