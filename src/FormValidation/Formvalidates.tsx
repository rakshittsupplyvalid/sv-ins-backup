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
  const errors = {
    quanityfound: '',
    Depositedfound: '',
  };

  // Helper function to validate a single field
  const validateField = (value: any, fieldName: string) => {
    const valueStr = String(value || '').trim();
    
    // Remove commas for validation (allows 1,000.00 or 1000.00)
    const numericStr = valueStr.replace(/,/g, '');
    
    // Allow numbers with optional decimal up to 5 places
    // Also ensures there's at least one digit before the decimal
    const decimalRegex = /^\d+(\.\d{1,5})?$/;
    
    if (!valueStr) {
      return `${fieldName} is required`;
    }
    
    if (!decimalRegex.test(numericStr)) {
      return `${fieldName} must be in valid MT format (e.g., 1, 1.0, or 2.57367)`;
    }
    
    return '';
  };

  errors.quanityfound = validateField(formData.quanityfound, 'Quantity Found');
  errors.Depositedfound = validateField(formData.Depositedfound, 'Deposited Found');

  const isValid = !errors.quanityfound && !errors.Depositedfound;

  return {
    isValid,
    message: isValid ? '' : errors.quanityfound || errors.Depositedfound,
    errors // Return all errors if you want to display them separately
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




