/**
 * Created by CaiWeiQi on 2021/8/30
 */
const zerorpc = require('zerorpc')
const client = new zerorpc.Client()
client.connect('tcp://127.0.0.1:4242')

const formula = document.querySelector('#formula')
const result = document.querySelector('#result')
formula.addEventListener('input', () => {
  client.invoke('eval', formula.value, (error, res) => {
    if (error) {
      console.error(error)
    } else {
      result.textContent = res
    }
  })
})
formula.dispatchEvent(new Event('input'))
