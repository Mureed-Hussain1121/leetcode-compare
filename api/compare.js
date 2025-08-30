import fetch from "node-fetch";

async function getSolvedProblems(username) {
  const query = `
    query userProfileQuestions($username: String!, $skip: Int!, $limit: Int!) {
      userProfileQuestions(
        username: $username,
        categorySlug: "all",
        skip: $skip,
        limit: $limit,
        filters: { status: "ACCEPTED" }
      ) {
        questions {
          title
          titleSlug
          difficulty
        }
      }
    }
  `;

  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { username, skip: 0, limit: 200 }
    })
  });

  const data = await response.json();
  return data.data?.userProfileQuestions?.questions || [];
}

export default async function handler(req, res) {
  const { user1, user2 } = req.query;

  if (!user1 || !user2) {
    return res.status(400).json({ error: "Provide ?user1=NAME&user2=NAME" });
  }

  const solved1 = await getSolvedProblems(user1);
  const solved2 = await getSolvedProblems(user2);

  const solvedSet1 = new Set(solved1.map(q => q.titleSlug));
  const diff = solved2.filter(q => !solvedSet1.has(q.titleSlug));

  res.status(200).json(diff);
}
