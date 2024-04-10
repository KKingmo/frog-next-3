import { createSystem } from "frog/ui"

import { theme } from "@/app/theme"

export const {
  Box,
  Columns,
  Column,
  Divider,
  Heading,
  HStack,
  Icon,
  Image,
  Rows,
  Row,
  Spacer,
  Text,
  VStack,
  vars,
} = createSystem({
  colors: {
    ...theme.colors,
  },
  fonts: {
    default: [
      {
        name: "Open Sans",
        source: "google",
        weight: 400,
      },
      {
        name: "Open Sans",
        source: "google",
        weight: 600,
      },
      {
        name: "Open Sans",
        source: "google",
        weight: 700,
      },
    ],
    madimi: [
      {
        name: "Madimi One",
        source: "google",
      },
    ],
  },
})
