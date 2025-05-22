import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"
import ErrorPage from "../views/ErrorPage.js"; 

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;

    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)

    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.setAttribute("accept", ".jpg, .jpeg, .png");  // file types pre-selection
    file.addEventListener("change", this.handleChangeFile)
    // Create an error message container
    this.errorMessage = document.createElement("span");
    this.errorMessage.style.color = "red";    
    this.errorMessage.style.fontSize = "0.9rem";
    this.errorMessage.style.marginTop = "5px";
    file.insertAdjacentElement("afterend", this.errorMessage);

    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  showError(message) {
    this.errorMessage.textContent = message;
  }

  handleChangeFile = e => {
    e.preventDefault()
    const fileInput = this.document.querySelector(`input[data-testid="file"]`)
    const file = fileInput.files[0]

    const fileName = file.name || ""
    //const fileExtension = fileName.split('.').pop().toLowerCase()
    const validTypes = ["image/jpeg", "image/png"]; // Allowed file types

    if (!validTypes.includes(file.type)) { // Check MIME type in stead of using file extension
      this.showError("Invalid file type. Please upload a JPG or PNG image.");
      fileInput.value = ""; // Reset the input field
      return;
    }

    // Clear error message if file is valid
    this.showError("");

    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        this.billId = key
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => {
        console.error("File upload error:", error);
        //throw error;
      });
  }
  handleSubmit = async e => {
    e.preventDefault()
    //console.log("in handleSubmit, datepicker.value:", e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }

    this.store
    .bills()
    .update({ data: JSON.stringify(bill), selector: this.billId })
    .then(() => {
      this.onNavigate(ROUTES_PATH['Bills'])
    })
    .catch(error => {
      // Append new error
      this.document.body.innerHTML += `<div data-testid="error-message">${error.message}</div>`;      
      //throw error;
    })

}

  // not need to cover this function by tests

  updateBill = (bill) => {
    console.log("***** updateBill Called in NewBill *******")
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        // Don't navigate here if you want to do it in handleSubmit
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => {
        //console.error(" Error in updateBill:", error);
        this.onNavigate(ROUTES_PATH['Bills'], error);// pass the error to display it in router
      });
    }
  }
}