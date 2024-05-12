const request = require("supertest");
const app = require("../app"); // Ensure this path is correct
const db = require("../db");

// Mock the db module
jest.mock("../db");

describe("GET /companies", () => {
  test("It should respond with an array of companies", async () => {
    const fakeCompanies = [{ code: "apple", name: "Apple Inc." }];
    db.query.mockResolvedValueOnce({ rows: fakeCompanies });

    const response = await request(app).get("/companies");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ companies: fakeCompanies });
    expect(db.query).toHaveBeenCalledWith("SELECT code, name FROM companies");
  });
});

describe("GET /companies/:code", () => {
  test("It should return company details", async () => {
    const fakeCompany = {
      code: "apple",
      name: "Apple Inc.",
      description: "Tech giant",
    };
    db.query.mockResolvedValueOnce({ rows: [fakeCompany] });

    const response = await request(app).get("/companies/apple");
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ company: fakeCompany });
  });

  test("It should handle company not found", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    const response = await request(app).get("/companies/banana");
    expect(response.statusCode).toBe(404);
    expect(response.body.error.message).toEqual("Company not found");
  });
});

describe("Company Routes", () => {
  describe("POST /companies", () => {
    test("It should create a new company", async () => {
      const newCompany = {
        name: "Test Company",
        description: "A test company",
      };
      const fakeCompany = {
        code: "test-company",
        name: "Test Company",
        description: "A test company",
      };
      db.query.mockResolvedValueOnce({ rows: [fakeCompany] });

      const response = await request(app).post("/companies").send(newCompany);
      expect(response.statusCode).toBe(201);
      expect(response.body.company).toEqual(fakeCompany);
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description",
        [expect.any(String), "Test Company", "A test company"]
      );
    });
  });

  describe("PUT /companies/:code", () => {
    test("It should update an existing company", async () => {
      const updatedData = {
        name: "Updated Company",
        description: "Updated description",
      };
      const fakeUpdatedCompany = {
        code: "test-company",
        name: "Updated Company",
        description: "Updated description",
      };
      db.query.mockResolvedValueOnce({ rows: [fakeUpdatedCompany] });

      const response = await request(app)
        .put("/companies/test-company")
        .send(updatedData);
      expect(response.statusCode).toBe(200);
      expect(response.body.company).toEqual(fakeUpdatedCompany);
      expect(db.query).toHaveBeenCalledWith(
        "UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description",
        ["Updated Company", "Updated description", "test-company"]
      );
    });

    test("It should return 404 if the company is not found", async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .put("/companies/nonexistent-code")
        .send({
          name: "Ghost Company",
          description: "Does not exist",
        });
      expect(response.statusCode).toBe(404);
    });
  });

  describe("DELETE /companies/:code", () => {
    test("It should delete an existing company", async () => {
      db.query.mockResolvedValueOnce({ rows: [{ code: "test-company" }] });

      const response = await request(app).delete("/companies/test-company");
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ status: "deleted" });
      expect(db.query).toHaveBeenCalledWith(
        "DELETE FROM companies WHERE code = $1 RETURNING code",
        ["test-company"]
      );
    });

    test("It should return 404 if the company to delete is not found", async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app).delete("/companies/nonexistent-code");
      expect(response.statusCode).toBe(404);
    });
  });
});
