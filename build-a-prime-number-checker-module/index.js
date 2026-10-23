/**
 * Checks whether a given number is prime.
 * A prime number is a whole number greater than 1 that has no divisors other than 1 and itself.
 *
 * @param {number} num - The number to evaluate.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
function isPrime(num) {
  if (typeof num !== "number" || !Number.isInteger(num) || num <= 1) {
    return false;
  }
  if (num <= 3) {
    return true;
  }
  if (num % 2 === 0 || num % 3 === 0) {
    return false;
  }
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) {
      return false;
    }
  }
  return true;
}

module.exports = {
  isPrime,
};
