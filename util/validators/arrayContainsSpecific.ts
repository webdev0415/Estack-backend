import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * ArrayContainsAllowedStrings - custom validator for allowed strings in array
 */
@ValidatorConstraint({ name: 'ArrayContainsAllowedStrings', async: false })
export class ArrayContainsAllowedStrings
  implements ValidatorConstraintInterface {
  /**
   * validate
   * @param {[string]} arr - array of strings
   * @param {[string]} constraints - allowed strings
   * @returns {boolean} - is array valid
   */
  validate(arr: [string], { constraints }: ValidationArguments) {
    if (Array.isArray(arr)) {
      return arr.every(elem => constraints.includes(elem));
    } else {
      return false;
    }
  }

  /**
   * defaultMessage
   * @param {ValidationArguments} - { property, constraints }
   * @returns {string} - error message
   */
  defaultMessage({ property, constraints }: ValidationArguments) {
    return `${property} array can contain only ${constraints.toString()}!`;
  }
}
