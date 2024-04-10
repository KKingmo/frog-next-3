/** @jsxImportSource frog/jsx */

import { paths } from "@/utils/config"
import { Env } from "@/utils/env-setup"
import { neynarClient } from "@/utils/neynar/neynar"
import { BulkCastsResponse } from "@neynar/nodejs-sdk/build/neynar-api/v2"
import { Button, Frog } from "frog"
import { devtools } from "frog/dev"
import { neynar } from "frog/middlewares"
import { handle } from "frog/next"
import { serveStatic } from "frog/serve-static"

import { Box, Heading, HStack, Icon, Image, Text, vars, VStack } from "@/app/ui"

const secrets = {
  FROG_SECRET: Env.FROG_SECRET,
  NEYNAR_API_KEY: Env.NEYNAR_API_KEY,
}

const DEV_MODE = process.env.NODE_ENV === "development"

type State = {
  State: {
    pageNumber: number
    result: {
      hash: string
      likes: number
      recasts: number
      replies: number
      castImage: string
      castUrl: string
    }[]
  }
}

const app = new Frog<State>({
  assetsPath: "/",
  basePath: paths.root,
  secret: secrets.FROG_SECRET,
  ui: { vars },
  initialState: {
    pageNumber: 0,
    result: [],
  },
}).use(
  neynar({
    apiKey: secrets.NEYNAR_API_KEY,
    features: ["interactor"],
  })
)

/** 루트 화면 */
app.frame("/", async (c) => {
  return c.res({
    image: (
      <Box grow padding={"32"} backgroundColor={"background"}>
        <Box grow borderRadius="8" justifyContent="center" gap="16">
          <VStack gap="4">
            <Heading size={"48"}>My Top 10 casts 🏆</Heading>
            <VStack gap="2">
              <Text size={"24"}>Search for my top 10 most popular casts.</Text>
            </VStack>
          </VStack>
          <VStack gap="4">
            <Text size={"24"} font={"madimi"}>
              If you like it, please follow @m-o 😉
            </Text>
          </VStack>
        </Box>
      </Box>
    ),
    intents: [<Button action="/start">Start</Button>],
  })
})

let fetchData: BulkCastsResponse

app.frame("/start", async (c) => {
  const { buttonValue, deriveState } = c
  const cVar = c.var
  const { interactor } = cVar

  const iFid = interactor?.fid || 0
  // const iFid = Number(Env.MY_FID) || 0
  const iName = interactor?.username || ""

  if (!buttonValue) {
    fetchData = await neynarClient.fetchPopularCastsByUser(iFid)
  }

  const state = deriveState((previousState) => {
    if (buttonValue === "prev") {
      previousState.pageNumber--
    }
    if (buttonValue === "next") previousState.pageNumber++
    if (!buttonValue) {
      previousState.result = fetchData.casts.map((item) => ({
        hash: item.hash,
        likes: item.reactions.likes.length,
        recasts: item.reactions.recasts.length,
        replies: item.replies.count,
        castImage: `https://client.warpcast.com/v2/cast-image?castHash=${item.hash}`,
        castUrl: `https://warpcast.com/${iName}/${item.hash}`,
      }))
    }
  })

  if (state.result.length === 0) {
    return c.res({
      imageAspectRatio: "1:1",
      image: (
        <SquareContainer>
          <Box
            grow
            alignHorizontal={"center"}
            alignVertical={"center"}
            paddingTop={"16"}
          >
            <Text size={"24"} font={"madimi"}>
              You haven't casted before 🤔.
            </Text>
          </Box>
        </SquareContainer>
      ),
      intents: [<Button action={"/"}>Reset</Button>],
    })
  }

  return c.res({
    imageAspectRatio: "1:1",
    image: (
      <SquareContainer>
        <Box
          grow
          alignHorizontal={"center"}
          alignVertical={"space-between"}
          paddingTop={"16"}
        >
          <VStack gap={"4"}>
            <HStack
              alignHorizontal={"center"}
              alignVertical={"center"}
              gap={"8"}
            >
              <Heading size={"24"}>Rank {state.pageNumber + 1}.</Heading>
              <Box alignVertical={"center"} grow={true}>
                <HStack alignVertical={"center"} gap={"4"}>
                  <HStack>
                    <Icon
                      name="chat-bubble-left"
                      collection={"heroicons"}
                      size="24"
                      color={"text"}
                    />
                    <Box>{state.result[state.pageNumber].replies}</Box>
                  </HStack>
                  <HStack>
                    <Icon
                      name="arrow-path"
                      collection={"heroicons"}
                      size="24"
                      color={"green"}
                    />
                    <Box>{state.result[state.pageNumber].recasts}</Box>
                  </HStack>
                  <HStack>
                    <Icon
                      name="heart"
                      collection={"heroicons"}
                      size="24"
                      color={"red"}
                    />
                    <Box>{state.result[state.pageNumber].likes}</Box>
                  </HStack>
                </HStack>
              </Box>
            </HStack>

            <Box grow height={"256"}>
              <Image
                width={"100%"}
                height={"100%"}
                objectFit={"contain"}
                src={`${state.result[state.pageNumber].castImage}`}
              />
            </Box>
            <Text size={"12"} font={"madimi"}>
              by @m-o. If you like it, please follow @m-o 😉
            </Text>
          </VStack>
        </Box>
      </SquareContainer>
    ),
    intents: [
      state.pageNumber > 0 && <Button value={"prev"}>⬅</Button>,
      state.pageNumber < 9 && <Button value={"next"}>➡</Button>,
      <Button.Link href={`${state.result[state.pageNumber].castUrl}`}>
        Go to this cast
      </Button.Link>,
    ],
  })
})

devtools(app, { serveStatic })
export const GET = handle(app)
export const POST = handle(app)

interface SquareContainerProps {
  children: React.ReactNode
}
const SquareContainer = ({ children }: SquareContainerProps) => {
  return (
    <Box
      backgroundColor="background"
      grow
      paddingLeft={"160"}
      paddingRight={"160"}
    >
      {children}
    </Box>
  )
}
