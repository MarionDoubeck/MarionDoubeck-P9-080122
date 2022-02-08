/**
 * @jest-environment jsdom
**/

import {screen} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import {localStorageMock} from "../__mocks__/localStorage.js"
import router from "../app/Router"
import LoadingPage from "../views/LoadingPage.js"
import ErrorPage from "../views/ErrorPage.js"
import Bills from "../containers/Bills"
import VerticalLayout from "../views/VerticalLayout"
import mockStore from "../__mocks__/store"
 
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES ({pathname})
}
const newBills = new Bills ({
  document, 
  onNavigate, 
  store : mockStore, 
  localStorage: localStorageMock
}) ;

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      const user = JSON.stringify({
        type: 'Employee'
      })
      window.localStorage.setItem('user', user)
      document.body.innerHTML = VerticalLayout(120)
      const pathname = ROUTES_PATH["Bills"];
      Object.defineProperty(window, "location", { value: { hash: pathname } });
      document.body.innerHTML = `<div id="root"></div>`;
      router()
      expect(screen.getByTestId("icon-window").classList.contains("active-icon")).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted);
    })
  })
  describe("When Bills Page is loading", () => {
    test("then LoadingPage is called", () => {
      document.body.innerHTML = BillsUI({ data: bills, loading:true})
      expect(LoadingPage).toBeCalled
    })
  })
  describe("When Bills Page is loading", () => {
    test("then LoadingPage is called", () => {
      document.body.innerHTML = BillsUI({ data: bills, loading:undefined, error:true})
      expect(ErrorPage()).toBeCalled
    })
  })
  describe("When I click on NewBill button", () => {
    test("it should renders newbill page", () => {
      document.body.innerHTML = BillsUI({ data: []})
      const handleClickNewBill = jest.fn(newBills.handleClickNewBill)
      const button=screen.getByTestId("btn-new-bill")
      button.addEventListener('click', handleClickNewBill);
      button.click()
      expect(handleClickNewBill).toBeCalled()
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy()
    });
  })
  describe("When I click on an eye", () => {
    test("bill-proof modal should open", () => {
      document.body.innerHTML = BillsUI({ data: bills})
      const newBills = new Bills ({
        document, 
        onNavigate, 
        store : mockStore, 
        localStorage: localStorageMock,
      }) ;
      $.fn.modal = jest.fn()
      const handleClickIconEye = jest.fn(newBills.handleClickIconEye)
      const iconEye=screen.getAllByTestId("icon-eye")
      iconEye.forEach(icon => {
        icon.addEventListener('click', handleClickIconEye(icon));
        icon.click()
      });
      expect(handleClickIconEye).toHaveBeenCalled()
      expect(screen.queryByText("Justificatif")).toBeTruthy();
    });
  })
})