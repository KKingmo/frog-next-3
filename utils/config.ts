export const NEXT_PUBLIC_URL_BASE =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : process.env.VERCEL_URL

export const paths = {
  root: "/api",
}

export const siteMetadata = {
  title: "My Top 10 casts",
  description: "Search for my top 10 most popular casts",
}
