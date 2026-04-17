---
title: Fourier transform
domain: math
source: wikipedia
source_url: https://en.wikipedia.org/wiki/Fourier_transform
confidence: medium
last_updated: 2026-04-17
word_count: 1527
---

# Fourier transform

## Overview

Mathematical transform that expresses a function of time as a function of frequency
Not to be confused with Fourier method or Fourier's original sine and cosine transforms.

The Fourier transform applied to the waveform of a C major piano chord (with logarithmic horizontal (frequency) axis). The first three peaks on the left correspond to the fundamental frequencies of the chord (C, E, G). The remaining smaller peaks are higher-frequency overtones of the fundamental pitches.
In mathematics, the Fourier transform (FT) is an integral transform that takes a function as input and outputs another function that describes the extent to which various frequencies are present in the original function. The output of the transform is a complex valued function of frequency. The term Fourier transform refers to both the mathematical operation and to this complex-valued function. When a distinction needs to be made, the output of the operation is sometimes called the frequency domain representation of the original function. The Fourier transform is analogous to decomposing the sound of a musical chord into the intensities of its constituent pitches.

The Fourier transform relates the time domain, in red, with a function in the domain of the frequency, in blue. The component frequencies, extended for the whole frequency spectrum, are shown as peaks in the domain of the frequency.
Functions that are localized in the time domain have Fourier transforms that are spread out across the frequency domain and vice versa, a phenomenon known as the uncertainty principle. The critical case for this principle is the Gaussian function, of substantial importance in probability theory and statistics as well as in the study of physical phenomena exhibiting normal distribution  (e.g., diffusion). The Fourier transform of a Gaussian function is another Gaussian function. Joseph Fourier introduced sine and cosine transforms (which correspond to the imaginary and real components of the modern Fourier transform) in his study of heat transfer, where Gaussian functions appear as solutions of the heat equation.

## Definition

The Fourier transform of a complex-valued function  on the real line, is the complex valued function &#8288;$}(\xi )}$&#8288;, defined by the integral

Fourier transform

$}(\xi )=\int _{-\infty }^{\infty }f(x)\ e^{-i2\pi \xi x}\,dx,\quad \forall \xi \in \mathbb {R} .}$ &#160; &#160;

  Eq.1

In this case  is (Lebesgue) integrable over the whole real line, i.e., the above integral converges to a continuous function $}(\xi )}$ at all  (decaying to zero as &#8288;&#8288;). 

However, the Fourier transform can also be defined for (generalized) functions for which the Lebesgue integral Eq.1 does not make sense. Interpreting the integral suitably (e.g. as an improper integral for locally integrable functions) extends the Fourier transform to functions that are not necessarily integrable over the whole real line. More generally, the Fourier transform also applies to generalized functions like the Dirac delta (and all other tempered distributions), in which case it is defined by duality rather than an integral.

First introduced in Fourier's Analytical Theory of Heat., the corresponding inversion formula for "sufficiently nice" functions is given by the Fourier inversion theorem, i.e., 

Inverse transform

- 
$^{\infty }{\widehat {f}}(\xi )\ e^{i2\pi \xi x}\,d\xi ,\quad \forall x\in \mathbb {R} .}$ &#160; &#160;

  Eq.2

The functions  and $}}$ are referred to as a Fourier transform pair.&#160; A common notation for designating transform pairs is:
$}{\longleftrightarrow }}\ {\widehat {f}}(\xi ).}$
For example, the Fourier transform of the delta function is the constant function &#8288;&#8288;:
$}{\longleftrightarrow }}\ 1.}$

### History

- Main articles: Fourier analysis §&#160;History, and Fourier series §&#160;History
In 1822, Fourier claimed (see Joseph Fourier §&#160;The Analytic Theory of Heat) that any function, whether continuous or discontinuous, can be expanded into a series of sines. That important work was corrected and expanded upon by others to provide the foundation for the various forms of the Fourier transform used since.

## Properties

Let  and  represent integrable functions Lebesgue-measurable on the real line satisfying:
$^{\infty }|f(x)|\,dx<\infty .}$
We denote the Fourier transforms of these functions as $}(\xi )}$ and $}(\xi )}$ respectively.

### Basic properties

The Fourier transform has the following basic properties:

Linearity
$}{\Longleftrightarrow }}\ \ a\ {\widehat {f}}(\xi )+b\ {\widehat {h}}(\xi );\quad \ a,b\in \mathbb {C} }$

Time shifting
$)\ \ {\stackrel {\mathcal {F}}{\Longleftrightarrow }}\ \ e^{-i2\pi x_{0}\xi }\ {\widehat {f}}(\xi );\quad \ x_{0}\in \mathbb {R} }$

Frequency shifting
$x}f(x)\ \ {\stackrel {\mathcal {F}}{\Longleftrightarrow }}\ \ {\widehat {f}}(\xi -\xi _{0});\quad \ \xi _{0}\in \mathbb {R} }$

Time scaling
$}{\Longleftrightarrow }}\ \ {\frac {1}{|a|}}{\widehat {f}}\left({\frac {\xi }{a}}\right);\quad \ a\neq 0}$
The case  leads to the time-reversal property:
$}{\Longleftrightarrow }}\ \ {\widehat {f}}(-\xi )}$

 


$}(\omega )}$

$}(\omega )}$





 The transform of an even-symmetric real-valued function &#8288;$}}}$&#8288; is also an even-symmetric real-valued function (&#8288;$}\!_{_{\text{RE}}}}$&#8288;).  The time-shift, &#8288;$}}+g_{_{\text{RO}}}}$&#8288;, creates an imaginary component, &#8288;$}_{_{\text{IO}}}}$&#8288;.  (See §&#160;Symmetry.)

Symmetry
When the real and imaginary parts of a complex function are decomposed into their even and odd parts, there are four components, denoted below by the subscripts RE, RO, IE, and IO.  And there is a one-to-one mapping between the four components of a complex time function and the four components of its complex frequency transform:

$$
{rlcccccccc}{\mathsf {Time\ domain}}&f&=&f_{_{\text{RE}}}&+&f_{_{\text{RO}}}&+&i\ f_{_{\text{IE}}}&+&\underbrace {i\ f_{_{\text{IO}}}} \\&{\Bigg \Updownarrow }{\mathcal {F}}&&{\Bigg \Updownarrow }{\mathcal {F}}&&\ \ {\Bigg \Updownarrow }{\mathcal {F}}&&\ \ {\Bigg \Updownarrow }{\mathcal {F}}&&\ \ {\Bigg \Updownarrow }{\mathcal {F}}\\{\mathsf {Frequency\ domain}}&{\widehat {f}}&=&{\widehat {f}}\!_{_{\text{RE}}}&+&\overbrace {i\ {\widehat {f}}\!_{_{\text{IO}}}} &+&i\ {\widehat {f}}\!_{_{\text{IE}}}&+&{\widehat {f}}\!_{_{\text{RO}}}\end{array}}}
$$
From this, various relationships are apparent, for example:

- The transform of a real-valued function (&#8288;$}}+f_{_{\text{RO}}}}$&#8288;) is the conjugate symmetric function &#8288;$}\!_{_{\text{RE}}}+i\ {\widehat {f}}\!_{_{\text{IO}}}}$&#8288;.  Conversely, a conjugate symmetric transform implies a real-valued time-domain.

- The transform of an imaginary-valued function (&#8288;$}}+i\ f_{_{\text{IO}}}}$&#8288;) is the conjugate antisymmetric function &#8288;$}\!_{_{\text{RO}}}+i\ {\widehat {f}}\!_{_{\text{IE}}}}$&#8288;, and the converse is true.

- The transform of a conjugate symmetric function $}}+i\ f_{_{\text{IO}}})}$ is the real-valued function &#8288;$}\!_{_{\text{RE}}}+{\widehat {f}}\!_{_{\text{RO}}}}$&#8288;, and the converse is true.

- The transform of a conjugate antisymmetric function $}}+i\ f_{_{\text{IE}}})}$ is the imaginary-valued function &#8288;$}\!_{_{\text{IE}}}+i\ {\widehat {f}}\!_{_{\text{IO}}}}$&#8288;, and the converse is true.
Conjugation
$f(x){\bigr )}^{*}\ \ {\stackrel {\mathcal {F}}{\Longleftrightarrow }}\ \ \left({\widehat {f}}(-\xi )\right)^{*}}$
(Note: the &#8288;&#8288; denotes complex conjugation.)

In particular, if  is real, then $}}$ is conjugate symmetric (a.k.a. Hermitian function):
$}(-\xi )={\bigl (}{\widehat {f}}(\xi ){\bigr )}^{*}.}$

If  is purely imaginary, then $}}$ is odd symmetric:
$}(-\xi )=-({\widehat {f}}(\xi ))^{*}.}$

Real and imaginary parts
$\{f(x)\}\ \ {\stackrel {\mathcal {F}}{\Longleftrightarrow }}\ \ {\tfrac {1}{2}}\left({\widehat {f}}(\xi )+{\bigl (}{\widehat {f}}(-\xi ){\bigr )}^{*}\right)}$
$\{f(x)\}\ \ {\stackrel {\mathcal {F}}{\Longleftrightarrow }}\ \ {\tfrac {1}{2i}}\left({\widehat {f}}(\xi )-{\bigl (}{\widehat {f}}(-\xi ){\bigr )}^{*}\right)}$

Zero frequency component
Substituting  in the definition, we obtain:
$}(0)=\int _{-\infty }^{\infty }f(x)\,dx.}$

The integral of  over its domain is known as the average value or DC bias of the function.

## Formulas

The following LaTeX expressions appear in the source article and are preserved verbatim for downstream ingestion:

- ${\displaystyle f(x)}$

- ${\displaystyle {\widehat {f}}(\xi )}$

$$
{\displaystyle {\widehat {f}}(\xi )=\int _{-\infty }^{\infty }f(x)\ e^{-i2\pi \xi x}\,dx,\quad \forall \xi \in \mathbb {R} .}
$$

- ${\displaystyle f(x)}$

- ${\displaystyle {\widehat {f}}(\xi )}$

- ${\displaystyle \xi }$

- ${\displaystyle \xi \to \infty }$

$$
{\displaystyle f(x)=\int _{-\infty }^{\infty }{\widehat {f}}(\xi )\ e^{i2\pi \xi x}\,d\xi ,\quad \forall x\in \mathbb {R} .}
$$

- ${\displaystyle f}$

- ${\displaystyle {\widehat {f}}}$

$$
{\displaystyle f(x)\ {\stackrel {\mathcal {F}}{\longleftrightarrow }}\ {\widehat {f}}(\xi ).}
$$

- ${\displaystyle 1}$

- ${\displaystyle \delta (x)\ {\stackrel {\mathcal {F}}{\longleftrightarrow }}\ 1.}$

- ${\displaystyle x}$

- ${\displaystyle t}$

- ${\displaystyle \xi }$

- ${\displaystyle f}$

- ${\displaystyle \omega =2\pi \xi }$

- ${\displaystyle \xi ={\tfrac {\omega }{2\pi }}}$

- ${\displaystyle {\widehat {f}}}$

- ${\displaystyle {\widehat {f}}_{1}}$

$$
{\displaystyle {\begin{aligned}{\widehat {f}}_{3}(\omega )&\triangleq \int _{-\infty }^{\infty }f(x)\cdot e^{-i\omega x}\,dx={\widehat {f}}_{1}\left({\tfrac {\omega }{2\pi }}\right),\\f(x)&={\frac {1}{2\pi }}\int _{-\infty }^{\infty }{\widehat {f}}_{3}(\omega )\cdot e^{i\omega x}\,d\omega .\end{aligned}}}
$$

- ${\displaystyle 2\pi }$

$$
{\displaystyle {\begin{aligned}{\widehat {f}}_{2}(\omega )&\triangleq {\frac {1}{\sqrt {2\pi }}}\int _{-\infty }^{\infty }f(x)\cdot e^{-i\omega x}\,dx={\frac {1}{\sqrt {2\pi }}}\ \ {\widehat {f}}_{1}\left({\tfrac {\omega }{2\pi }}\right),\\f(x)&={\frac {1}{\sqrt {2\pi }}}\int _{-\infty }^{\infty }{\widehat {f}}_{2}(\omega )\cdot e^{i\omega x}\,d\omega .\end{aligned}}}
$$

$$
{\displaystyle {\begin{aligned}{\widehat {f}}_{1}(\xi )\ &\triangleq \ \int _{-\infty }^{\infty }f(x)\,e^{-i2\pi \xi x}\,dx={\sqrt {2\pi }}\ \ {\widehat {f}}_{2}(2\pi \xi )={\widehat {f}}_{3}(2\pi \xi )\\f(x)&=\int _{-\infty }^{\infty }{\widehat {f}}_{1}(\xi )\,e^{i2\pi x\xi }\,d\xi \end{aligned}}}
$$

$$
{\displaystyle {\begin{aligned}{\widehat {f}}_{2}(\omega )\ &\triangleq \ {\frac {1}{\sqrt {2\pi }}}\ \int _{-\infty }^{\infty }f(x)\,e^{-i\omega x}\,dx={\frac {1}{\sqrt {2\pi }}}\ \ {\widehat {f}}_{1}\!\left({\frac {\omega }{2\pi }}\right)={\frac {1}{\sqrt {2\pi }}}\ \ {\widehat {f}}_{3}(\omega )\\f(x)&={\frac {1}{\sqrt {2\pi }}}\ \int _{-\infty }^{\infty }{\widehat {f}}_{2}(\omega )\,e^{i\omega x}\,d\omega \end{aligned}}}
$$

$$
{\displaystyle {\begin{aligned}{\widehat {f}}_{3}(\omega )\ &\triangleq \ \int _{-\infty }^{\infty }f(x)\,e^{-i\omega x}\,dx={\widehat {f}}_{1}\left({\frac {\omega }{2\pi }}\right)={\sqrt {2\pi }}\ \ {\widehat {f}}_{2}(\omega )\\f(x)&={\frac {1}{2\pi }}\int _{-\infty }^{\infty }{\widehat {f}}_{3}(\omega )\,e^{i\omega x}\,d\omega \end{aligned}}}
$$

$$
{\displaystyle {\begin{aligned}{\widehat {f}}_{1}(\xi )\ &\triangleq \ \int _{\mathbb {R} ^{n}}f(x)e^{-i2\pi \xi \cdot x}\,dx=(2\pi )^{\frac {n}{2}}{\widehat {f}}_{2}(2\pi \xi )={\widehat {f}}_{3}(2\pi \xi )\\f(x)&=\int _{\mathbb {R} ^{n}}{\widehat {f}}_{1}(\xi )e^{i2\pi \xi \cdot x}\,d\xi \end{aligned}}}
$$

$$
{\displaystyle {\begin{aligned}{\widehat {f}}_{2}(\omega )\ &\triangleq \ {\frac {1}{(2\pi )^{\frac {n}{2}}}}\int _{\mathbb {R} ^{n}}f(x)e^{-i\omega \cdot x}\,dx={\frac {1}{(2\pi )^{\frac {n}{2}}}}{\widehat {f}}_{1}\!\left({\frac {\omega }{2\pi }}\right)={\frac {1}{(2\pi )^{\frac {n}{2}}}}{\widehat {f}}_{3}(\omega )\\f(x)&={\frac {1}{(2\pi )^{\frac {n}{2}}}}\int _{\mathbb {R} ^{n}}{\widehat {f}}_{2}(\omega )e^{i\omega \cdot x}\,d\omega \end{aligned}}}
$$

$$
{\displaystyle {\begin{aligned}{\widehat {f}}_{3}(\omega )\ &\triangleq \ \int _{\mathbb {R} ^{n}}f(x)e^{-i\omega \cdot x}\,dx={\widehat {f}}_{1}\left({\frac {\omega }{2\pi }}\right)=(2\pi )^{\frac {n}{2}}{\widehat {f}}_{2}(\omega )\\f(x)&={\frac {1}{(2\pi )^{n}}}\int _{\mathbb {R} ^{n}}{\widehat {f}}_{3}(\omega )e^{i\omega \cdot x}\,d\omega \end{aligned}}}
$$

## Sources

[source:wikipedia] *Fourier transform* — Wikipedia. https://en.wikipedia.org/wiki/Fourier_transform. Retrieved 2026-04-17. Confidence: medium.
