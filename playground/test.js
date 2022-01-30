class Car {
  constructor(brand, year) {
    //   2022 ford
    //   this.carName = 'Ford'
    this.carname = brand
    this.year = year
  }
  present() {
    //   I have a ford
    return 'I have a ' + this.carname
  }

  condition() {
    return `it was made in ${this.year}`
  }

  sound() {
    return 'it makes a loud roar !'
  }
}

class Model extends Car {
  constructor(brand, mod, year) {
    super(brand, year)
    this.model = mod
  }
  show() {
    return this.present() + ', it is a ' + this.model
  }

  voice() {
    return new this.constructor('Mercedes', 'AMG')
    // return this.constructor
    // return this
    // return this.present()
  }
}

const newCar = new Model('Ford', 'Mustang', 2022)
console.log(newCar.voice())
// so I pass ford up to the car class
// console.log(newCar.voice())
// console.log(newCar.condition())

// function myError() {
//   console.log(this)
// }

// myError()
