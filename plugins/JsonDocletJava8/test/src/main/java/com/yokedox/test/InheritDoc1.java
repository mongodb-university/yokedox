package com.yokedox.test;

/**
 * Inherit doc
 */
public interface InheritDoc1 {
	/**
	 * Inherit this description.
	 *
	 * @return Inherit this return.
	 */
	public int explicitInheritDocMethod();

	/**
	 * Inherit this description despite having no docs in override.
	 *
	 * @return noDocMethod inherit return
	 */
    public int noDocMethod();

    /**
     * Ignore this comment in the override.
     *
     * @param x noReturnOrParamTagMethod inherit param
     * @return noReturnOrParamTagMethod inherit return
     */
    public int noReturnOrParamTagMethod(int x);
}
