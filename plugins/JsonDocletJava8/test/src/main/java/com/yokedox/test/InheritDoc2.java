package com.yokedox.test;

/**
 * Inherit doc
 */
public class InheritDoc2 implements InheritDoc1 {
    /**
     * Ignore this text! {@inheritDoc} instead.
     *
     * @return Ignore this and {@inheritDoc}!
     */
    public int explicitInheritDocMethod() {
        return 1;
    }

    // No doc, should automatically inherit
    public int noDocMethod() {
        return 1;
    }

    // Should automatically inherit param and return tag while keeping the main comment.
    /**
     * Returns x.
     *
     * This method, given x, returns x.
     */
    public int noReturnOrParamTagMethod(int x) {
        return x;
    }

}
