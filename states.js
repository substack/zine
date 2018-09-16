module.exports = States

function States (init, states) {
  var self = this
  if (!(this instanceof States)) return new States(init, states)
  this.last = null
  this.states = states
  this.state = init
  this.value = {}
  Object.keys(states).forEach(function (state) {
    Object.keys(states[state].state).forEach(function (key) {
      self.value[key] = null
    })
  })
  this.keys = Object.keys(this.value)
}

States.prototype.go = function (state) {
  this.state = state
  this.last = null
}

States.prototype.tick = function (t) {
  if (this.last === null) this.last = t
  if (t - this.last >= this.states[this.state].t) {
    this.last += this.states[this.state].t
    this.state = this.states[this.state].next
  }
  var A = this.states[this.state]
  var B = this.states[A.next]
  var x = (t - this.last) / A.t
  for (var i = 0; i < this.keys.length; i++) {
    var key = this.keys[i]
    var e = A.easing && typeof A.easing[key] === 'function'
      ? A.easing[key](x)
      : x
    this.value[key] = mix(A.state[key],B.state[key],e)
  }
  return this.value
}

function mix (a, b, x) {
  x = Math.max(0,Math.min(1,x))
  return a*(1-x) + b*x
}
