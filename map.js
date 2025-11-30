'use strict';

Array.prototype.myMap = function (func) {
  const mappedResult = [];

  for (let i = 0; i < this.length; i++) {
    mappedResult.push(func(this[i], i, this));
  }

  return mappedResult;
};

console.log([1, 2, 3, 4].myMap(a => a * a));
