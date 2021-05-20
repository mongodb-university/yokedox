package com.yokedox.test;

/**
 * AnnotationCascadeChild
 */
public @interface AnnotationCascadeChild {

	/**
	 * The name.
	 * 
	 * @return The name.
	 */
	public String name();

	public String[] dummyData() default {};

	public Annotation3[] subAnnotations() default {};

}
