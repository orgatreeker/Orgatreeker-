import { type NextRequest, NextResponse } from "next/server"

const BUDGET_ASSISTANT_PROMPT = `You are an expert financial budgeting assistant for a budgeting app called Orgatreeker.

Your job is to onboard the user by asking smart, step-by-step questions to understand their financial situation. Collect information about:
- Monthly income
- Fixed expenses and rent
- Any debt amount
- Location (for cost of living)
- Main financial goal (save aggressively, clear debt, balanced life, enjoy lifestyle)

After collecting enough details, calculate the best personalized budgeting percentage split for NEEDS, WANTS, and SAVINGS. 

Important rules:
1. Do NOT assume 50/30/20 by default. Recommend the percentage based on the user's data and goals.
2. If they have debt, adjust the plan to focus more on savings and debt repayment.
3. Always ensure the total of NEEDS + WANTS + SAVINGS = 100.
4. Keep your explanation simple and beginner-friendly.
5. At the end, respond ONLY in this JSON format:

{
  "needs": number,
  "wants": number,
  "savings": number,
  "recommendation": "A short explanation of why this split is best for the user."
}`

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Create a detailed prompt with user's financial data
    const userPrompt = `
    User's Financial Information:
    - Monthly Income: $${data.monthlyIncome}
    - Monthly Rent: $${data.rent}
    - Other Fixed Expenses: $${data.fixedExpenses}
    - Total Debt: $${data.debtAmount}
    - Location: ${data.location}
    - Financial Goal: ${data.financialGoal}
    - Additional Info: ${data.additionalInfo}
    
    Please analyze this information and provide a personalized budget recommendation.
    `

    // For now, we'll create a simple rule-based recommendation
    // In a real implementation, you would use an AI service here
    const income = Number.parseFloat(data.monthlyIncome) || 0
    const rent = Number.parseFloat(data.rent) || 0
    const fixedExpenses = Number.parseFloat(data.fixedExpenses) || 0
    const debt = Number.parseFloat(data.debtAmount) || 0

    const totalFixedCosts = rent + fixedExpenses
    const fixedCostRatio = totalFixedCosts / income
    const hasDebt = debt > 0

    let needs, wants, savings
    let recommendation

    // Calculate personalized percentages based on user's situation
    if (hasDebt && debt > income * 6) {
      // High debt situation - aggressive debt payoff
      needs = Math.min(Math.ceil(fixedCostRatio * 100) + 5, 65)
      wants = 15
      savings = 100 - needs - wants
      recommendation =
        "With significant debt, we're prioritizing aggressive debt payoff while keeping wants minimal. This aggressive savings rate will help you become debt-free faster."
    } else if (data.financialGoal === "save_aggressively") {
      // Aggressive saver
      needs = Math.min(Math.ceil(fixedCostRatio * 100) + 5, 55)
      wants = 20
      savings = 100 - needs - wants
      recommendation =
        "As an aggressive saver, we're maximizing your savings rate while ensuring you can still enjoy life. This split will help you build wealth quickly."
    } else if (data.financialGoal === "enjoy_lifestyle") {
      // Lifestyle focused
      needs = Math.min(Math.ceil(fixedCostRatio * 100) + 5, 60)
      wants = 35
      savings = 100 - needs - wants
      recommendation =
        "This split allows you to enjoy your lifestyle while still building a solid financial foundation. You'll have plenty for entertainment and hobbies."
    } else if (data.financialGoal === "clear_debt" && hasDebt) {
      // Debt focused
      needs = Math.min(Math.ceil(fixedCostRatio * 100) + 5, 60)
      wants = 20
      savings = 100 - needs - wants
      recommendation =
        "This plan focuses on debt elimination while maintaining a reasonable lifestyle. The higher savings rate will accelerate your debt payoff."
    } else {
      // Balanced approach (default)
      needs = Math.min(Math.ceil(fixedCostRatio * 100) + 5, 55)
      wants = 25
      savings = 100 - needs - wants
      recommendation =
        "This balanced approach ensures your needs are covered while allowing for enjoyment and steady wealth building. It's sustainable long-term."
    }

    // Ensure percentages are valid
    if (needs + wants + savings !== 100) {
      const diff = 100 - (needs + wants + savings)
      savings += diff
    }

    return NextResponse.json({
      needs,
      wants,
      savings,
      recommendation,
    })
  } catch (error) {
    console.error("Budget assistant error:", error)
    return NextResponse.json({ error: "Failed to generate recommendation" }, { status: 500 })
  }
}
