// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM fully loaded");
  
  // Check if EmailJS is properly initialized
  function checkEmailJSAvailability() {
    if (typeof emailjs !== 'undefined' && window.emailJSInitialized === true) {
      console.log("EmailJS is available in contact.js, setting up form listeners");
      setupFormListeners();
    } else {
      console.log("EmailJS is not available in contact.js. This should not happen if the script loading order is correct.");
      // Try again with a longer delay, this is a fallback
      setTimeout(function() {
        if (typeof emailjs !== 'undefined') {
          console.log("EmailJS initialized on retry");
          setupFormListeners();
        } else {
          console.error("EmailJS could not be loaded. Please check your connection and try again.");
        }
      }, 1000); // Extended timeout for safety
    }
  }
  
  // Start the checking process
  checkEmailJSAvailability();
});

// Setup all form event listeners
function setupFormListeners() {
  // Get the contact form element
  const contactForm = document.getElementById("contact-form");
  
  if (contactForm) {
    console.log("Contact form found, attaching event listeners");
    
    // Add submit event listener to the form
    contactForm.addEventListener("submit", function(e) {
      // Prevent the default form submission behavior
      e.preventDefault();
      e.stopPropagation();
      console.log("Form submission intercepted");
      
      // Process the form submission
      handleFormSubmit();
      
      // Ensure no submission happens
      return false;
    });
    
    // Also capture the button click event
    const sendButton = document.getElementById("sendBtn");
    if (sendButton) {
      sendButton.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("Send button clicked");
        handleFormSubmit();
        return false;
      });
    }
    
    // Add input validation listeners
    document.getElementById("name").addEventListener("input", function() {
      validateField("name", "Name is required");
    });
    
    document.getElementById("email").addEventListener("input", function() {
      validateEmail();
    });
    
    document.getElementById("subject").addEventListener("input", function() {
      validateField("subject", "Subject is required");
    });
    
    document.getElementById("message").addEventListener("input", function() {
      validateField("message", "Message is required");
    });
  } else {
    console.error("Contact form not found in the document!");
  }
}

// Handler for form submission
function handleFormSubmit() {
  console.log("Processing form submission...");
  
  // Reset any previous error messages
  resetErrors();
  
  // Get the status message element
  const statusMessage = document.getElementById("status-message");
  statusMessage.classList.add("hidden");
  
  // Get form field values
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();
  
  console.log("Form values:", { name, email, subject, message });
  
  // Validate all fields
  const isNameValid = validateField("name", "Name is required");
  const isEmailValid = validateEmail();
  const isSubjectValid = validateField("subject", "Subject is required");
  const isMessageValid = validateField("message", "Message is required");
  
  // If any validation fails, stop submission
  if (!isNameValid || !isEmailValid || !isSubjectValid || !isMessageValid) {
    console.log("Validation failed, stopping submission");
    return false;
  }
  
  // Show loading state
  const sendButton = document.getElementById("sendBtn");
  const originalButtonText = sendButton.textContent;
  sendButton.textContent = "Sending...";
  sendButton.disabled = true;
  
  // Double check EmailJS is available
  if (typeof emailjs === 'undefined') {
    console.error("EmailJS is not available");
    showStatus("Email service unavailable. Please try again later.", "error");
    sendButton.textContent = originalButtonText;
    sendButton.disabled = false;
    return;
  }
  
  // Prepare email parameters
  const templateParams = {
    name: name,
    email: email,
    subject: subject,
    message: message
  };
  
  console.log("Sending email via EmailJS...");
  
  // Send email using EmailJS
  emailjs.send("service_9x3x5df", "template_a1ethkb", templateParams)
    .then(function(response) {
      console.log("Email sent successfully:", response);
      
      // Show success message
      showStatus("Thank you! Your message has been sent successfully.", "success");
      
      // Reset the form fields
      document.getElementById("contact-form").reset();
      
      // Hide the success message after a delay
      setTimeout(() => {
        statusMessage.classList.add("hidden");
      }, 6000);
    })
    .catch(function(error) {
      console.error("EmailJS Error:", error);
      
      // Show error message
      showStatus("Oops! Something went wrong. Please try again.", "error");
    })
    .finally(function() {
      // Reset button state
      sendButton.textContent = originalButtonText;
      sendButton.disabled = false;
    });
}

// Validate a generic field
function validateField(fieldId, errorMessage) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(`${fieldId}-error`);
  const value = field.value.trim();
  
  if (!value) {
    errorElement.textContent = errorMessage;
    errorElement.classList.remove("hidden");
    field.classList.add("border-red-400");
    return false;
  } else {
    errorElement.classList.add("hidden");
    field.classList.remove("border-red-400");
    return true;
  }
}

// Validate email specifically
function validateEmail() {
  const email = document.getElementById("email").value.trim();
  const errorElement = document.getElementById("email-error");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    errorElement.textContent = "Email is required";
    errorElement.classList.remove("hidden");
    document.getElementById("email").classList.add("border-red-400");
    return false;
  } else if (!emailPattern.test(email)) {
    errorElement.textContent = "Please enter a valid email address";
    errorElement.classList.remove("hidden");
    document.getElementById("email").classList.add("border-red-400");
    return false;
  } else {
    errorElement.classList.add("hidden");
    document.getElementById("email").classList.remove("border-red-400");
    return true;
  }
}

// Reset all error messages
function resetErrors() {
  // Hide all error messages
  const errorElements = document.querySelectorAll("[id$='-error']");
  errorElements.forEach(element => {
    element.classList.add("hidden");
  });
  
  // Remove red borders
  const formInputs = document.querySelectorAll("input, textarea");
  formInputs.forEach(input => {
    input.classList.remove("border-red-400");
  });
}

// Show status message
function showStatus(message, type) {
  const statusMessage = document.getElementById("status-message");
  statusMessage.textContent = message;
  statusMessage.classList.remove("hidden");
  
  if (type === "success") {
    statusMessage.classList.remove("text-red-400");
    statusMessage.classList.add("text-green-400");
  } else {
    statusMessage.classList.remove("text-green-400");
    statusMessage.classList.add("text-red-400");
  }
}