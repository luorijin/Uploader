var Uploader = require('../../../src/uploader')

describe('webKitDataTransfer', function () {
  var uploader

  beforeEach(function () {
    uploader = new Uploader()
  })

  var getWebKitFile = function (filename) {
    return {
      isFile: true,
      isDirectory: false,
      fullPath: '/home/user/foo/' + filename,
      file: function (callback) {
        callback({
          relativePath: '/foo/' + filename
        })
      }
    }
  }

  it('should return empty array', function() {
    var event = {
      dataTransfer: {
        items: [
          {
            webkitGetAsEntry: function () {
              return false
            }
          }
        ]
      }
    }
    spyOn(uploader, 'addFiles')
    uploader.webkitReadDataTransfer(event.dataTransfer, event)
    expect(uploader.addFiles).toHaveBeenCalledWith([], event)
  })

  it('should return one file', function() {
    var event = {
      dataTransfer: {
        items: [
          {
            webkitGetAsEntry: function () {
              return getWebKitFile('111.txt')
            },
            getAsFile: function () {
              return {
                relativePath: '/foo/111.txt'
              }
            }
          }
        ]
      }
    }
    spyOn(uploader, 'addFiles')
    uploader.webkitReadDataTransfer(event.dataTransfer, event)
    expect(uploader.addFiles).toHaveBeenCalledWith(
      [{relativePath: 'home/user/foo/111.txt'}],
      event
    )
  })

  it('should return one file from subdirectory', function() {
    var event = {
      dataTransfer: {
        items: [
          {
            webkitGetAsEntry: function () {
              return {
                isFile: false,
                isDirectory: true,
                fullPath: '/home/user/foo/',
                createReader: function () {
                  var entries = [
                    getWebKitFile('111.txt')
                  ]
                  return {
                    readEntries: function (success, error) {
                      var entry = entries.shift()
                      if (entry) {
                        return success([entry])
                      } else {
                        return success([])
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      }
    }
    spyOn(uploader, 'addFiles')
    uploader.webkitReadDataTransfer(event.dataTransfer, event)
    expect(uploader.addFiles).toHaveBeenCalledWith(
      [{relativePath: 'home/user/foo/111.txt'}],
      event
    )
  })

  it('should return two files from subdirectory', function() {
    var event = {
      dataTransfer: {
        items: [
          {
            webkitGetAsEntry: function () {
              return {
                isFile: false,
                isDirectory: true,
                fullPath: '/home/user/foo/',
                createReader: function () {
                  var entries = [
                    getWebKitFile('111.txt'),
                    getWebKitFile('222.txt')
                  ]
                  return {
                    readEntries: function (success, error) {
                      var entry = entries.shift()
                      if (entry) {
                        return success([entry])
                      } else {
                        return success([])
                      }
                    }
                  }
                }
              }
            }
          }
        ]
      }
    }
    spyOn(uploader, 'addFiles')
    uploader.webkitReadDataTransfer(event.dataTransfer, event)
    expect(uploader.addFiles).toHaveBeenCalledWith(
      [
        {relativePath: 'home/user/foo/111.txt'},
        {relativePath: 'home/user/foo/222.txt'}
      ],
      event
    )
  })
})
