export const listsAreEqual = (a, b) => {
  const arr1 = a || []
  const arr2 = b || []
  return JSON.stringify(arr1.sort()) === JSON.stringify(arr2.sort())
}
