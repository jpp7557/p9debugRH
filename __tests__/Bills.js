/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import '@testing-library/jest-dom'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import Bills from "../containers/Bills.js";  //Import the default class as Bills
import ErrorPage from "../views/ErrorPage.js"; 
import router from "../app/Router"


//import fetchMock from "jest-fetch-mock";
//fetchMock.enableMocks();


jest.mock("../app/Store", () => ({
  __esModule: true,
  default: mockStore,
}))

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
    //test("Then the Bill page should have a new-bill button", async () => {
      
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      router()
      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true);  //added 17.03.2025

    })
    test("Then bills (should) be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      //console.log("========== in __test__/Bills.js, BEFORE Sorting\n")
      //console.log("BillUI:\n",document.body.innerHTML)
      //console.table(bills, ['name', 'date', 'amount']);
      const dates = screen.getAllByText(/^(19|20)\d\d[-/.](0[1-9]|1[012])[-/.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      //const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const antiChrono = (a, b) => (new Date(b) - new Date(a));
      const datesSorted = [...dates].sort(antiChrono);
      //console.log("========== in __test__/Bills.js, AFTER Sorting")
      //console.log("dates, datesSorted\n", dates, "\n", datesSorted)
      expect(dates).toEqual(datesSorted);
    });
  });


  // to-do ? Additional Feature Tests from Bills.js
  describe("Feature tests from Bills container", () => {
    test("handleClickNewBill should navigate to NewBill page", () => {
      const onNavigate = jest.fn();

      const billsInstance = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      });

      billsInstance.handleClickNewBill();
      expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['NewBill']);
    });

    test("handleClickIconEye should show the bill image", async () => {
  
      // Set up the DOM structure with a valid image URL
      document.body.innerHTML = `
        <div data-testid="icon-eye" data-bill-url="https://example.com/image.jpg"></div>
        <div id="modaleFile"><div class="modal-body"></div></div>
      `;
      
      // Mock jQuery modal to test modal showing
      $.fn.modal = jest.fn();
    
      const iconEye = screen.getByTestId("icon-eye");
    
      // Create an instance of Bills to call the method
      const billsInstance = new Bills({
        document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage
      });
    
      // Call the method that handles the click event
      await billsInstance.handleClickIconEye(iconEye);

      console.log('Modal mock call count:', $.fn.modal.mock.calls.length);
      console.log('Modal mock call arguments:', $.fn.modal.mock.calls);
    
      // Check if the modal is shown
      expect($.fn.modal).toHaveBeenCalledWith('show');
    
      // Check if the image is displayed in the modal
      const modalBody = document.querySelector(".modal-body");
      const img = modalBody.querySelector("img");
      console.log("In test show bill, HTML elements :", document.body.innerHTML);
      console.log("In test show bill, modalBody HTML elements :", modalBody.innerHTML);
      expect(img).not.toBeNull();
      expect(img.alt).toBe("Bill");
    });

    test("getBills should sort, and format bills", async () => {
      const storeMock = {
        bills: () => ({
          list: () => Promise.resolve(bills)
        })
      };

      const billsInstance = new Bills({
        document,
        onNavigate: jest.fn(),
        store: storeMock,
        localStorage: window.localStorage
      });

      const result = await billsInstance.getBills();
      //console.table(result, ['id', 'date', 'rawDate', 'amount']); // mon ajout

      expect(result.length).toBe(bills.length);     // mon ajout
      expect(result[0]).toHaveProperty("date");     // mon ajout
      expect(result[0]).toHaveProperty("rawDate");  // mon ajout
      expect(result[0]).toHaveProperty("status");   // mon ajout

      //expect(new Date(result[0].rawDate).getTime()).toBeGreaterThanOrEqual(new Date(result[1].rawDate).getTime());
      const rawDates = result.map(bill => bill.rawDate);
      console.log("rawDates", rawDates);
      const antiChrono = (a, b) => (new Date(b) - new Date(a));
      const datesSorted = [...rawDates].sort(antiChrono)
      expect(rawDates).toEqual(datesSorted)

    });
  });    
    
  // test d'intégration GET
  describe("When connected as employee", () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
      document.body.innerHTML = `<div id="root"></div>`

      router()
    }) 
    test("Mes notes de frais should be displayed", async () => {
      window.onNavigate(ROUTES_PATH.Bills)

      await waitFor(() => {
        //expect(screen.getByTestId('btn-new-bill')).toBeInTheDocument()
        expect(screen.getByText(/mes notes de frais/i)).toBeInTheDocument()
      })
    })
  })

  // test d'intégration Erreur 404, 500
  describe("When API returns an error", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills"); // spy on the mock method
  
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
  
      document.body.innerHTML = `<div id="root"></div>`;
      router();
    });

    test("should display 500 error message", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => Promise.reject(new Error("Erreur 500"))
        };
      });
  
      window.onNavigate(ROUTES_PATH.Bills);
  
      const message = await screen.findByText(/Erreur 500/i);
      expect(message).toBeInTheDocument();
    });
  
    test("should display 404 error message", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
            list: () =>  Promise.reject(new Error("Erreur 404"))
        };        
      });
  
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText(/Erreur 404/));
      console.log("Bills Test for error 404\n",document.body.innerHTML);
      const errorMsg = await screen.getByTestId("error-message");
      console.log("test pour erreur 404 errorMsg.textContent:\n",errorMsg.textContent);
      expect(errorMsg).toBeInTheDocument();
      expect(errorMsg.textContent).toMatch(/Erreur 404/i);
    });
  })
})

