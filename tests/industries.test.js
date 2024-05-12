const request = require("supertest");
const app = require("../app");
const db = require("../db");

// Mock the db module
jest.mock("../db");

describe("Industries Routes", () => {
  describe("POST /industries", () => {
    test("It should add a new industry", async () => {
      const newIndustry = { code: "tech", industry: "Technology" };
      const fakeIndustry = { code: "tech", industry: "Technology" };
      db.query.mockResolvedValueOnce({ rows: [fakeIndustry] });

      const response = await request(app).post("/industries").send(newIndustry);
      expect(response.statusCode).toBe(201);
      expect(response.body.industry).toEqual(fakeIndustry);
    });
  });

  describe("GET /industries", () => {
    test("It should list all industries with associated companies", async () => {
      const fakeIndustries = [
        {
          code: "tech",
          industry: "Technology",
          company_codes: ["apple", "google"],
        },
      ];
      db.query.mockResolvedValueOnce({ rows: fakeIndustries });

      const response = await request(app).get("/industries");
      expect(response.statusCode).toBe(200);
      expect(response.body.industries).toEqual(fakeIndustries);
    });
  });

  describe("POST /industries/associate", () => {
    test("It should associate an industry with a company", async () => {
      const association = { company_code: "apple", industry_code: "tech" };
      db.query.mockResolvedValueOnce({});

      const response = await request(app)
        .post("/industries/associate")
        .send(association);
      expect(response.statusCode).toBe(201);
      expect(response.text).toBe("Association created successfully");
    });
  });
});
