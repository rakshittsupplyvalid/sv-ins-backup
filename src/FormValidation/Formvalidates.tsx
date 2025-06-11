export function validateStepOne(formData: any) {
  // Check if all required fields are selected
  if (!formData.option1 || !formData.option2 || !formData.option3) {
    return {
      isValid: false,
      message: 'Please select all dropdown options before proceeding'
    };
  }
  return {
    isValid: true,
    message: ''
  };


}



export function validateSteptwo(formData: any) {
  // Check if all required fields are selected
  if (!formData.noOfChawls) {
    return {
      isValid: false,
      message: 'Please Enter the atleast one Number of Chawls'
    };
  }
  return {
    isValid: true,
    message: ''
  };
}


export function validateStepthree(formData: any) {
  const rawValue = formData.quanityfound;
  const rawValuesecond = formData.Depositedfound;

  const valueStr = String(rawValue || '').trim();
  const valueStrSecond = String(rawValuesecond || '').trim();

  // Allow numbers with optional decimal up to 5 places (e.g. 1, 2.5, 3.12345)
  const decimalRegex = /^\d+(\.\d{1,5})?$/;

  const errors: string[] = [];

//   if (!valueStr) {
//     errors.push('Please enter the Quantity Found.');
//   } 
  if (!decimalRegex.test(valueStr)) {
    errors.push('Quantity Found must be in valid MT format (e.g. 1.00000 or 2.57367).');
  }

//   if (!valueStrSecond) {
//     errors.push('Please enter the Deposited Found.');
//   } 
 if (!decimalRegex.test(valueStrSecond)) {
    errors.push('Deposited Found must be in valid MT format (e.g. 1.00000 or 2.57367).');
  }

  return {
    isValid: errors.length === 0,
    message: errors.join('\n'),
  };
}


export function validateStepFour(formData: any) {
  // Check if all required fields are selected
  if (!formData.Farmers) {
    return {
      isValid: false,
      message: 'Please Enter the Number of Farmer'
    };
  }
  return {
    isValid: true,
    message: ''
  };
}


export function validateStepFive(formData: any) {
  // Check if all required fields are selected
  if (!formData.stockQuality) {
    return {
      isValid: false,
      message: 'Please select the quality of stock'
    };
  }

  if(!formData.staffBehavior){
    return{
        isValid : false,
        message : 'Please select the staff of Behavior'
    }

  }
  return {
    isValid: true,
    message: ''
  };
}




