function fn1(a, b) {
  return a + b
}

// const ans1 = fn1(1, 2)

function fn2(fn) {
  const ans = fn(2)
  console.log(ans)
}

fn2((a) => {
  return a + 1
})
