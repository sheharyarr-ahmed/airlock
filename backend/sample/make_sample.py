"""Generate a deterministic multi-page sample PDF for verification.

Run: python backend/sample/make_sample.py
Produces beacon-handbook.pdf next to this script. Each page carries a distinct
fact so retrieval + page citation can be checked against a known answer:
  - page 2 holds the vacation-days fact (the in-document verification question).
"""
from __future__ import annotations

import pathlib

import fitz  # PyMuPDF

PAGES = [
    (
        "Beacon Coffee Roasters — Employee Handbook",
        "Welcome to Beacon Coffee Roasters. This handbook summarizes the policies "
        "that apply to all employees. It is a fictional document created solely to "
        "test the Airlock document assistant.",
    ),
    (
        "Time Off and Leave",
        "Full-time employees accrue 18 days of paid vacation per year. Vacation "
        "accrues monthly and unused days may be carried over once. Sick leave is "
        "separate and does not count against the vacation balance.",
    ),
    (
        "Office and Facilities",
        "The company office is located at 42 Harbor Street. Office hours are 8am to "
        "6pm on weekdays. Visitors must sign in at the front desk before entering "
        "the roastery floor.",
    ),
    (
        "Expenses and Reimbursement",
        "Reimbursement requests must be submitted within 30 days of the expense. "
        "Receipts are required for any amount above ten dollars. Approved requests "
        "are paid out with the next payroll cycle.",
    ),
]


def build() -> pathlib.Path:
    doc = fitz.open()
    for title, body in PAGES:
        page = doc.new_page()
        page.insert_text((72, 96), title, fontsize=18, fontname="helv")
        page.insert_textbox(
            fitz.Rect(72, 130, 523, 700), body, fontsize=12, fontname="helv"
        )
    out = pathlib.Path(__file__).parent / "beacon-handbook.pdf"
    doc.save(out)
    doc.close()
    return out


if __name__ == "__main__":
    path = build()
    print(f"wrote {path} ({len(PAGES)} pages)")
