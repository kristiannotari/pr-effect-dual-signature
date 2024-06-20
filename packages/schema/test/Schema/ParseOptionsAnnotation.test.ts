import * as S from "@effect/schema/Schema"
import * as Util from "@effect/schema/test/TestUtils"
import { describe, it } from "vitest"

const String = S.transform(S.NonEmpty, S.String, { decode: (s) => s, encode: (s) => s }).annotations({
  identifier: "string"
})

describe("ParseOptionsAnnotation", () => {
  it("nested structs", async () => {
    const schema = S.Struct({
      a: S.Struct({
        b: String,
        c: String
      }).annotations({ parseOptions: { errors: "first" } }),
      d: String
    }).annotations({ parseOptions: { errors: "all" } })
    await Util.expectDecodeUnknownFailure(
      schema,
      { a: {} },
      `{ readonly a: { readonly b: string; readonly c: string }; readonly d: string }
├─ ["a"]
│  └─ { readonly b: string; readonly c: string }
│     └─ ["b"]
│        └─ is missing
└─ ["d"]
   └─ is missing`,
      { errors: "first" }
    )

    await Util.expectEncodeFailure(
      schema,
      { a: { b: "", c: "" }, d: "" },
      `{ readonly a: { readonly b: string; readonly c: string }; readonly d: string }
├─ ["a"]
│  └─ { readonly b: string; readonly c: string }
│     └─ ["b"]
│        └─ string
│           └─ Encoded side transformation failure
│              └─ NonEmpty
│                 └─ Predicate refinement failure
│                    └─ Expected NonEmpty, actual ""
└─ ["d"]
   └─ string
      └─ Encoded side transformation failure
         └─ NonEmpty
            └─ Predicate refinement failure
               └─ Expected NonEmpty, actual ""`,
      { errors: "first" }
    )
  })
})
