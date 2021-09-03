import { Project } from "../../Project.js";
import { md } from "../../yokedast.js";
import { AnyTag } from "./doclet8.js";
import { tagsToMdast } from "./tagsToYokedast.js";

describe("tagsToYokedast", () => {
  it("handles HTML lists with inline code tags", () => {
    const inlineTags = [
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: "A ",
        inlineTags: [{ _class: "Tag", name: "Text", kind: "Text", text: "A " }],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "A" },
        ],
      },
      {
        _class: "Tag",
        name: "@code",
        kind: "@code",
        text: "MutableRealmInteger",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "MutableRealmInteger",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "MutableRealmInteger",
          },
        ],
      },
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: " is a mutable, ",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: " is a mutable, ",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "is a mutable,",
          },
        ],
      },
      {
        _class: "SeeTag",
        name: "@link",
        kind: "@see",
        text: "Long",
        inlineTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "Long" },
        ],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "Long" },
        ],
        label: "",
        referencedClassName: "java.lang.Long",
        referencedClass: {
          _class: "ClassDoc",
          asString: "java.lang.Long",
          typeName: "Long",
          qualifiedTypeName: "java.lang.Long",
          simpleTypeName: "Long",
          dimension: "",
          isPrimitive: false,
          isClass: true,
          isAnnotationType: false,
          modifiers: "public final",
        },
      },
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: "-like numeric quantity.\n It behaves almost exactly as a reference to a ",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "-like numeric quantity.\n It behaves almost exactly as a reference to a ",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "-like numeric quantity.",
          },
        ],
      },
      {
        _class: "SeeTag",
        name: "@link",
        kind: "@see",
        text: "Long",
        inlineTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "Long" },
        ],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "Long" },
        ],
        label: "",
        referencedClassName: "java.lang.Long",
        referencedClass: {
          _class: "ClassDoc",
          asString: "java.lang.Long",
          typeName: "Long",
          qualifiedTypeName: "java.lang.Long",
          simpleTypeName: "Long",
          dimension: "",
          isPrimitive: false,
          isClass: true,
          isAnnotationType: false,
          modifiers: "public final",
        },
      },
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: ". More specifically:\n <ul>\n <li>A ",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: ". More specifically:\n <ul>\n <li>A ",
          },
        ],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "." },
        ],
      },
      {
        _class: "Tag",
        name: "@code",
        kind: "@code",
        text: "MutableRealmInteger",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "MutableRealmInteger",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "MutableRealmInteger",
          },
        ],
      },
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: " may have the value ",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: " may have the value ",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "may have the value",
          },
        ],
      },
      {
        _class: "Tag",
        name: "@code",
        kind: "@code",
        text: "null",
        inlineTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "null" },
        ],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "null" },
        ],
      },
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: ".</li>\n <li>The ",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: ".</li>\n <li>The ",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: ".</li>\n <li>The",
          },
        ],
      },
      {
        _class: "SeeTag",
        name: "@link",
        kind: "@see",
        text: "#equals",
        inlineTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "#equals" },
        ],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "#equals" },
        ],
        label: "",
        referencedClassName: "io.realm.MutableRealmInteger",
        referencedClass: {
          _class: "ClassDoc",
          asString: "io.realm.MutableRealmInteger",
          typeName: "MutableRealmInteger",
          qualifiedTypeName: "io.realm.MutableRealmInteger",
          simpleTypeName: "MutableRealmInteger",
          dimension: "",
          isPrimitive: false,
          isClass: true,
          isAnnotationType: false,
          modifiers: "public abstract",
        },
        referencedMemberName: "equals",
      },
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: " operator compares the contained ",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: " operator compares the contained ",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "operator compares the contained",
          },
        ],
      },
      {
        _class: "SeeTag",
        name: "@link",
        kind: "@see",
        text: "Long",
        inlineTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "Long" },
        ],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "Long" },
        ],
        label: "",
        referencedClassName: "java.lang.Long",
        referencedClass: {
          _class: "ClassDoc",
          asString: "java.lang.Long",
          typeName: "Long",
          qualifiedTypeName: "java.lang.Long",
          simpleTypeName: "Long",
          dimension: "",
          isPrimitive: false,
          isClass: true,
          isAnnotationType: false,
          modifiers: "public final",
        },
      },
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: " values. ",
        inlineTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: " values. " },
        ],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "values." },
        ],
      },
      {
        _class: "Tag",
        name: "@code",
        kind: "@code",
        text: "null",
        inlineTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "null" },
        ],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "null" },
        ],
      },
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: "-valued ",
        inlineTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "-valued " },
        ],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "-valued" },
        ],
      },
      {
        _class: "Tag",
        name: "@code",
        kind: "@code",
        text: "MutableRealmInteger",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "MutableRealmInteger",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "MutableRealmInteger",
          },
        ],
      },
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: " are ",
        inlineTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: " are " },
        ],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "are" },
        ],
      },
      {
        _class: "Tag",
        name: "@code",
        kind: "@code",
        text: ".equals",
        inlineTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: ".equals" },
        ],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: ".equals" },
        ],
      },
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: "</li>\n <li>The ",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "</li>\n <li>The ",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "</li>\n <li>The",
          },
        ],
      },
      {
        _class: "SeeTag",
        name: "@link",
        kind: "@see",
        text: "#compareTo",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "#compareTo",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "#compareTo",
          },
        ],
        label: "",
        referencedClassName: "io.realm.MutableRealmInteger",
        referencedClass: {
          _class: "ClassDoc",
          asString: "io.realm.MutableRealmInteger",
          typeName: "MutableRealmInteger",
          qualifiedTypeName: "io.realm.MutableRealmInteger",
          simpleTypeName: "MutableRealmInteger",
          dimension: "",
          isPrimitive: false,
          isClass: true,
          isAnnotationType: false,
          modifiers: "public abstract",
        },
        referencedMemberName: "compareTo",
      },
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: " operator compares the contained ",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: " operator compares the contained ",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "operator compares the contained",
          },
        ],
      },
      {
        _class: "SeeTag",
        name: "@link",
        kind: "@see",
        text: "Long",
        inlineTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "Long" },
        ],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "Long" },
        ],
        label: "",
        referencedClassName: "java.lang.Long",
        referencedClass: {
          _class: "ClassDoc",
          asString: "java.lang.Long",
          typeName: "Long",
          qualifiedTypeName: "java.lang.Long",
          simpleTypeName: "Long",
          dimension: "",
          isPrimitive: false,
          isClass: true,
          isAnnotationType: false,
          modifiers: "public final",
        },
      },
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: " values.  It considers ",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: " values.  It considers ",
          },
        ],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "values." },
        ],
      },
      {
        _class: "Tag",
        name: "@code",
        kind: "@code",
        text: "null",
        inlineTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "null" },
        ],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "null" },
        ],
      },
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: " &lt; any non-",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: " &lt; any non-",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "&lt; any non-",
          },
        ],
      },
      {
        _class: "Tag",
        name: "@code",
        kind: "@code",
        text: "null",
        inlineTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "null" },
        ],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "null" },
        ],
      },
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: " value.</li>\n <li>The ",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: " value.</li>\n <li>The ",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "value.</li>\n <li>The",
          },
        ],
      },
      {
        _class: "SeeTag",
        name: "@link",
        kind: "@see",
        text: "#increment",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "#increment",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "#increment",
          },
        ],
        label: "",
        referencedClassName: "io.realm.MutableRealmInteger",
        referencedClass: {
          _class: "ClassDoc",
          asString: "io.realm.MutableRealmInteger",
          typeName: "MutableRealmInteger",
          qualifiedTypeName: "io.realm.MutableRealmInteger",
          simpleTypeName: "MutableRealmInteger",
          dimension: "",
          isPrimitive: false,
          isClass: true,
          isAnnotationType: false,
          modifiers: "public abstract",
        },
        referencedMemberName: "increment",
      },
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: " and ",
        inlineTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: " and " },
        ],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "and" },
        ],
      },
      {
        _class: "SeeTag",
        name: "@link",
        kind: "@see",
        text: "#decrement",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "#decrement",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "#decrement",
          },
        ],
        label: "",
        referencedClassName: "io.realm.MutableRealmInteger",
        referencedClass: {
          _class: "ClassDoc",
          asString: "io.realm.MutableRealmInteger",
          typeName: "MutableRealmInteger",
          qualifiedTypeName: "io.realm.MutableRealmInteger",
          simpleTypeName: "MutableRealmInteger",
          dimension: "",
          isPrimitive: false,
          isClass: true,
          isAnnotationType: false,
          modifiers: "public abstract",
        },
        referencedMemberName: "decrement",
      },
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: " operators throw ",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: " operators throw ",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "operators throw",
          },
        ],
      },
      {
        _class: "SeeTag",
        name: "@link",
        kind: "@see",
        text: "IllegalStateException",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "IllegalStateException",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "IllegalStateException",
          },
        ],
        label: "",
        referencedClassName: "java.lang.IllegalStateException",
        referencedClass: {
          _class: "ClassDoc",
          asString: "java.lang.IllegalStateException",
          typeName: "IllegalStateException",
          qualifiedTypeName: "java.lang.IllegalStateException",
          simpleTypeName: "IllegalStateException",
          dimension: "",
          isPrimitive: false,
          isClass: true,
          isAnnotationType: false,
          modifiers: "public",
        },
      },
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: " when applied to a ",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: " when applied to a ",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "when applied to a",
          },
        ],
      },
      {
        _class: "Tag",
        name: "@code",
        kind: "@code",
        text: "null",
        inlineTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "null" },
        ],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "null" },
        ],
      },
      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: "-valued ",
        inlineTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "-valued " },
        ],
        firstSentenceTags: [
          { _class: "Tag", name: "Text", kind: "Text", text: "-valued" },
        ],
      },
      {
        _class: "Tag",
        name: "@code",
        kind: "@code",
        text: "MutableRealmInteger",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "MutableRealmInteger",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: "MutableRealmInteger",
          },
        ],
      },

      {
        _class: "Tag",
        name: "Text",
        kind: "Text",
        text: ".</li>\n </ul>\n",
        inlineTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: ".</li>\n </ul>\n",
          },
        ],
        firstSentenceTags: [
          {
            _class: "Tag",
            name: "Text",
            kind: "Text",
            text: ".</li>\n </ul>",
          },
        ],
      },
    ];
    const yokedast = tagsToMdast(
      {
        linkToEntity: () => {
          return md.text("<link>");
        },
      } as unknown as Project,
      inlineTags as AnyTag[]
    );
    expect(yokedast).toStrictEqual({
      children: [
        {
          children: [
            {
              type: "text",
              value: "A ",
            },
            {
              type: "inlineCode",
              value: "MutableRealmInteger",
            },
            {
              type: "text",
              value: "is a mutable, ",
            },
            {
              type: "text",
              value: "<link>",
            },
            {
              type: "text",
              value:
                "-like numeric quantity. It behaves almost exactly as a reference to a ",
            },
            {
              type: "text",
              value: "<link>",
            },
            {
              type: "text",
              value: ". More specifically:",
            },
          ],
          type: "paragraph",
        },
        {
          children: [
            {
              checked: null,
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          type: "text",
                          value: "A ",
                        },
                        {
                          type: "inlineCode",
                          value: "MutableRealmInteger",
                        },
                        {
                          type: "text",
                          value: "may have the value ",
                        },
                        {
                          type: "inlineCode",
                          value: "null",
                        },
                        {
                          type: "text",
                          value: ".",
                        },
                      ],
                      type: "paragraph",
                    },
                  ],
                  type: "paragraph",
                },
              ],
              position: {
                end: {
                  column: 1149,
                  line: 4,
                  offset: 3955,
                },
                start: {
                  column: 2,
                  line: 4,
                  offset: 2808,
                },
              },
              spread: false,
              type: "listItem",
            },
            {
              checked: null,
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          type: "text",
                          value: "The ",
                        },
                        {
                          type: "text",
                          value: "<link>",
                        },
                        {
                          type: "text",
                          value: "operator compares the contained ",
                        },
                        {
                          type: "text",
                          value: "<link>",
                        },
                        {
                          type: "text",
                          value: "values. ",
                        },
                        {
                          type: "inlineCode",
                          value: "null",
                        },
                        {
                          type: "text",
                          value: "-valued ",
                        },
                        {
                          type: "inlineCode",
                          value: "MutableRealmInteger",
                        },
                        {
                          type: "text",
                          value: "are ",
                        },
                        {
                          type: "inlineCode",
                          value: ".equals",
                        },
                      ],
                      type: "paragraph",
                    },
                  ],
                  type: "paragraph",
                },
              ],
              position: {
                end: {
                  column: 3977,
                  line: 5,
                  offset: 7932,
                },
                start: {
                  column: 2,
                  line: 5,
                  offset: 3957,
                },
              },
              spread: false,
              type: "listItem",
            },
            {
              checked: null,
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          type: "text",
                          value: "The ",
                        },
                        {
                          type: "text",
                          value: "<link>",
                        },
                        {
                          type: "text",
                          value: "operator compares the contained ",
                        },
                        {
                          type: "text",
                          value: "<link>",
                        },
                        {
                          type: "text",
                          value: "values. It considers ",
                        },
                        {
                          type: "inlineCode",
                          value: "null",
                        },
                        {
                          type: "text",
                          value: "< any non-",
                        },
                        {
                          type: "inlineCode",
                          value: "null",
                        },
                        {
                          type: "text",
                          value: "value.",
                        },
                      ],
                      type: "paragraph",
                    },
                  ],
                  type: "paragraph",
                },
              ],
              position: {
                end: {
                  column: 3422,
                  line: 6,
                  offset: 11354,
                },
                start: {
                  column: 2,
                  line: 6,
                  offset: 7934,
                },
              },
              spread: false,
              type: "listItem",
            },
            {
              checked: null,
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          type: "text",
                          value: "The ",
                        },
                        {
                          type: "text",
                          value: "<link>",
                        },
                        {
                          type: "text",
                          value: "and ",
                        },
                        {
                          type: "text",
                          value: "<link>",
                        },
                        {
                          type: "text",
                          value: "operators throw ",
                        },
                        {
                          type: "text",
                          value: "<link>",
                        },
                        {
                          type: "text",
                          value: "when applied to a ",
                        },
                        {
                          type: "inlineCode",
                          value: "null",
                        },
                        {
                          type: "text",
                          value: "-valued ",
                        },
                        {
                          type: "inlineCode",
                          value: "MutableRealmInteger",
                        },
                        {
                          type: "text",
                          value: ".",
                        },
                      ],
                      type: "paragraph",
                    },
                  ],
                  type: "paragraph",
                },
              ],
              position: {
                end: {
                  column: 4774,
                  line: 7,
                  offset: 16128,
                },
                start: {
                  column: 2,
                  line: 7,
                  offset: 11356,
                },
              },
              spread: false,
              type: "listItem",
            },
          ],
          ordered: false,
          position: {
            end: {
              column: 7,
              line: 8,
              offset: 16135,
            },
            start: {
              column: 2,
              line: 3,
              offset: 2802,
            },
          },
          spread: false,
          start: null,
          type: "list",
        },
      ],
      position: {
        end: {
          column: 1,
          line: 9,
          offset: 16136,
        },
        start: {
          column: 1,
          line: 1,
          offset: 0,
        },
      },
      type: "root",
    });
  });
});
