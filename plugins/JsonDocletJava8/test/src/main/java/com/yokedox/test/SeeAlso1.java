package com.yokedox.test;

/**
 * SeeAlso1
 *
 * Here's a link to something else: {@link com.yokedox.test.SeeAlso2#seeAlso2Method}
 *
 * Here's a plain link to something else: {@linkplain com.yokedox.test.SeeAlso2#seeAlso2Method}
 *
 * @see com.yokedox.test.SeeAlso2
 * @see <a href="some/link">did you know they support links like this?</a>
 * @see <h1>arbitrary html</h1>
 */
public class SeeAlso1 {
  /**
   * Method
   *
   * @see com.yokedox.test.SeeAlso2
   * @see com.yokedox.test.theseLinksAreNotVerified
   */
  public void seeAlso1Method() {
  }

  public void seeAlso1Method(String a, int b, float c) {
  }
}
