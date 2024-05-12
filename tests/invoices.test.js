const request = require("supertest");
const app = require("../app");
const db = require("../db");

jest.mock("../db");

describe("Invoice Routes", () => {
  describe("GET /invoices", () => {
    test("should return all invoices", async () => {
      const fakeInvoices = [{ id: 1, comp_code: "apple" }];
      db.query.mockResolvedValueOnce({ rows: fakeInvoices });

      const response = await request(app).get("/invoices");
      expect(response.statusCode).toBe(200);
      expect(response.body.invoices).toEqual(fakeInvoices);
    });
  });

  describe("GET /invoices/:id", () => {
    test("should return details of a specific invoice", async () => {
      const fakeInvoice = {
        id: 1,
        comp_code: "apple",
        amt: 100,
        paid: false,
        add_date: "2021-01-01",
        paid_date: null,
        company: {
          code: "apple",
          name: "Apple Inc",
          description: "Tech giant",
        },
      };
      db.query.mockResolvedValueOnce({ rows: [fakeInvoice] });

      const response = await request(app).get("/invoices/1");
      expect(response.statusCode).toBe(200);
      expect(response.body.invoice).toEqual(fakeInvoice);
    });

    test("should return 404 if the invoice is not found", async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).get("/invoices/999");
      expect(response.statusCode).toBe(404);
    });
  });

  describe("POST /invoices", () => {
    test("should create a new invoice", async () => {
      const newInvoice = { comp_code: "apple", amt: 100 };
      const fakeInvoice = {
        id: 1,
        comp_code: "apple",
        amt: 100,
        paid: false,
        add_date: "2021-01-01",
        paid_date: null,
      };
      db.query.mockResolvedValueOnce({ rows: [fakeInvoice] });

      const response = await request(app).post("/invoices").send(newInvoice);
      expect(response.statusCode).toBe(201);
      expect(response.body.invoice).toEqual(fakeInvoice);
    });
  });

  describe("PUT /invoices/:id", () => {
    test("should update an invoice", async () => {
      const updatedInvoice = { amt: 200, paid: true };
      const fakeInvoice = {
        id: 1,
        comp_code: "apple",
        amt: 200,
        paid: true,
        add_date: "2021-01-01",
        paid_date: "2021-02-01",
      };

      db.query.mockResolvedValueOnce({
        rows: [{ paid: false, paid_date: null }],
      }); // Initial check for current invoice status
      db.query.mockResolvedValueOnce({ rows: [fakeInvoice] }); // Mocking the actual update operation

      const response = await request(app)
        .put("/invoices/1")
        .send(updatedInvoice);
      expect(response.statusCode).toBe(200);
      expect(response.body.invoice).toEqual(fakeInvoice);
    });

    test("should return 404 if trying to update a non-existent invoice", async () => {
      db.query.mockResolvedValueOnce({ rows: [] }); // Mocking no invoice found

      const response = await request(app)
        .put("/invoices/999")
        .send({ amt: 200, paid: true });
      expect(response.statusCode).toBe(404);
    });
  });

  test("should return 404 if trying to update a non-existent invoice", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .put("/invoices/999")
      .send({ amt: 200, paid: true });
    expect(response.statusCode).toBe(404);
  });
});

describe("DELETE /invoices/:id", () => {
  test("should delete an invoice", async () => {
    db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

    const response = await request(app).delete("/invoices/1");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "deleted" });
  });

  test("should return 404 if trying to delete a non-existent invoice", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).delete("/invoices/999");
    expect(response.statusCode).toBe(404);
  });
});
