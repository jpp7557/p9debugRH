/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import NewBill from "../containers/NewBill.js"
import NewBillUI from "../views/NewBillUI.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import ErrorPage from "../views/ErrorPage.js"; 
import router from "../app/Router.js";

jest.mock("../app/Store", () => ({
  __esModule: true,
  default: mockStore,
}))

describe("Given I am connected as an employee", () => {
  
  describe("When I am on NewBill Page", () => {
    test("Then the new bill form should be present", async () =>  {
      // Assign a mocked version of localStorage to window.localStorage
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      // Create a root div for rendering
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      // Navigate to the NewBill page
      window.onNavigate(ROUTES_PATH.NewBill)
      // Ensure the NewBill form is in the document
      await waitFor(() => screen.getByTestId('form-new-bill'))
      expect(screen.getByTestId('form-new-bill')).toBeInTheDocument()
    })
  })
  
  describe("Given I am on NewBill Page", () => {
    describe("When I submit a valid form", () => {
      test("it should call updateBill and navigate to Bills page", async () => {

        // Mock localStorage
        Object.defineProperty(window, "localStorage", { value: localStorageMock })
        window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }))

        const root = document.createElement("div")
        root.setAttribute("id", "root")
        document.body.append(root)

        // Set up DOM elements
        document.body.innerHTML = `
          <form data-testid="form-new-bill">
            <select data-testid="expense-type"></select>
            <input data-testid="expense-name" value="Hotel" />
            <input data-testid="amount" value="200" />
            <input data-testid="datepicker" value="2024-03-15" />
            <input data-testid="vat" value="10" />
            <input data-testid="pct" value="20" />
            <textarea data-testid="commentary">Business trip</textarea>    
            <input data-testid="file" type="file" />
            <button type="submit">Submit</button>
          </form>
          `
        // Mock navigation function
        const onNavigate = jest.fn()

        // Mock storerage
        const mockStore = {
          bills: jest.fn(() => ({
            update: jest.fn().mockResolvedValue({}) // Simulate async API call
          }))
        }
        // Create instance of NewBill
        const newBill = new NewBill({ 
          document, 
          onNavigate, 
          store: mockStore, 
          localStorage: window.localStorage
        })

        // Simulate form submission
        const form = screen.getByTestId("form-new-bill")
        fireEvent.submit(form)
        // Expect navigation to Bills page
        await waitFor(() => {
          expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Bills)
        })
      })
    })
    describe("When I upload a file with valid file type (jpg/pgn)", () => {
      test("Then handleChangeFile should store file details", async () => {
        // Set up DOM
        document.body.innerHTML = `
          <form data-testid="form-new-bill">
              <input data-testid="file" type="file" />
          </form>
        `
        // Mock store method
        const mockStore = {
          bills: jest.fn(() => ({
            create: jest.fn().mockResolvedValue({ fileUrl: "mockFileUrl", key: "mockKey" })
          }))
        }

        // Mock localStorage
        Object.defineProperty(window, "localStorage", { value: { getItem: jest.fn(() => JSON.stringify({ email: "test@email.com" })) } })

        // Create instance of NewBill
        const newBill = new NewBill({ 
          document,
          onNavigate: jest.fn(),
          store: mockStore,
          localStorage: window.localStorage
        })

        // Get file input and mock a file
        const fileInput = screen.getByTestId("file")
        const testFile = new File(["dummy content"], "test.jpg", { type: "image/jpeg" })

        // Simulate file selection
        fireEvent.change(fileInput, { target: { files: [testFile] } })

        // Wait for promise to resolve
        await new Promise(process.nextTick)

        // Check if file details are stored
        expect(newBill.fileName).toBe("test.jpg")
        expect(newBill.fileUrl).toBe("mockFileUrl")
        expect(newBill.billId).toBe("mockKey")
      })
    })
    describe("When I upload a file with invalid file type", () => {
      test("Then the field should remains empty", () => {
        window.alert = jest.fn() // Mock alert

        document.body.innerHTML = `
        <form data-testid="form-new-bill">
              <input data-testid="file" type="file" />
          </form>
        `
        const newBill = new NewBill({ document })

        const fileInput = screen.getByTestId("file")
        const loadFile = new File(["test"], "test.pdf", { type: "application/pdf" })

        fireEvent.change(fileInput, { target: { files: [loadFile] } })

        //expect(window.alert).toHaveBeenCalledWith(expect.stringContaining("Invalid file type"))
        expect(fileInput.value).toBe("")
      })
    })
  })
})

// Integration tests
describe("Given I am on NewBill Page and submitting a valid form", () => {
  describe("When API Error 404 ", () => {
    
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a",
      }))

      document.body.innerHTML = `<div id="root"></div>`;
      
      router()
    })

    test("should display error 404", async () => {

      // 🔧 Setup the mocked store
      mockStore.bills = jest.fn(() => ({
      update: () => Promise.reject(new Error("Erreur 404 dans API Mocked ")),
      }))

      // Navigate to NewBill page
      window.onNavigate(ROUTES_PATH.NewBill)
  
      // Submit form
      const form = screen.getByTestId("form-new-bill")
      fireEvent.submit(form)
    
      // Wait for error message to be displayed
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
      expect(message.textContent).toMatch(/Erreur 404/)
    })
  })



  describe("When API Error 500 ", () => {
    
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a",
      }))

      document.body.innerHTML = `<div id="root"></div>`;
      
      router()
    })

    test("should display error 500", async () => {

      // 🔧 Setup the mocked store
      mockStore.bills = jest.fn(() => ({
      update: () => Promise.reject(new Error("Erreur 500 dans API Mocked ")),
      }))

      // Navigate to NewBill page
      window.onNavigate(ROUTES_PATH.NewBill)
  
      // Submit form
      const form = screen.getByTestId("form-new-bill")
      fireEvent.submit(form)
    
      // Wait for error message to be displayed
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
      expect(message.textContent).toMatch(/Erreur 500/)
    })
  })
})
