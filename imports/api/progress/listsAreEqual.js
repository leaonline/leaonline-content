export const listsAreEqual = (a = [], b = []) => JSON.stringify(a.sort()) === JSON.stringify(b.sort())
