import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"
import BillsUI from "../views/BillsUI.js"
import ErrorPage from "../views/ErrorPage.js"; 

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  
  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

  getBills = () => {
    console.log("[17.03.2025] in src/containers/Bills.js, getBills called") // 17.03.2025
    try {
      if (this.store) {
        return this.store
        .bills()
        .list()
        .then(snapshot => {
          const bills = snapshot
          .map(doc => ({
            ...doc,
            rawDate: doc.date // 17.03.2025 Store raw date for sorting
            })
          )
          // Sorting BEFORE formatting 17.03.2025
          .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate))
          // Apply formatting AFTER sorting  // 17.03.2025
          .map(doc => {
            try {
              return {
                ...doc,
                date: formatDate(doc.rawDate),
                status: formatStatus(doc.status)
              };
            } catch (e) {
              console.error('Date formatting error:', e, 'for', doc);
              return {
                ...doc,
                date: doc.rawDate, // Keep raw date if formatting fails  17.03.2025
                status: formatStatus(doc.status)
              };
            }
          });
          console.log('[17.03.2025] src/containers/Bills.js, bills.length :', bills.length)
          return bills
        })
        .catch(error => {
          // Trigger an error display when there's an issue
          throw error;
        });
      }
    } catch (error) {
      // Handle any unexpected errors
      throw error;
    }    
  }
}