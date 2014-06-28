from __future__ import division
from nec.demathutils import *
import operator
from nec.print_out import printOut

def wrap_function(function):
    ncalls = [0]
    def function_wrapper(x):
        ncalls[0] += 1
        return float(function(x))
    return ncalls, function_wrapper


def fmin(evaluator, xtol=1e-4, ftol=1e-4, maxiter=None, maxfun=None,
         full_output=0, disp=1, callback=None):
    """Minimize a function using the downhill simplex algorithm.

    Parameters
    ----------
    func : callable func(x,*args)
        The objective function to be minimized.
    x0 : ndarray
        Initial guess.
    args : tuple
        Extra arguments passed to func, i.e. ``f(x,*args)``.
    callback : callable
        Called after each iteration, as callback(xk), where xk is the
        current parameter vector.

    Returns
    -------
    xopt : ndarray
        Parameter that minimizes function.
    fopt : float
        Value of function at minimum: ``fopt = func(xopt)``.
    iter : int
        Number of iterations performed.
    funcalls : int
        Number of function calls made.
    warnflag : int
        1 : Maximum number of function evaluations made.
        2 : Maximum number of iterations reached.
    allvecs : list
        Solution at each iteration.

    Other Parameters
    ----------------
    xtol : float
        Relative error in xopt acceptable for convergence.
    ftol : number
        Relative error in func(xopt) acceptable for convergence.
    maxiter : int
        Maximum number of iterations to perform.
    maxfun : number
        Maximum number of function evaluations to make.
    full_output : bool
        Set to True if fval and warnflag outputs are desired.
    disp : bool
        Set to True to print convergence messages.
    
    Notes
    -----
    Uses a Nelder-Mead simplex algorithm to find the minimum of
    a function of one or more variables.

    """
    fcalls, func = wrap_function(evaluator.target)
    x0 = evaluator.x
    #x0 = asfarray(x0).flatten()
    N = len(x0)
    if maxiter is None:
        maxiter = N * 200
    if maxfun is None:
        maxfun = N * 200

    rho = 1; chi = 2; psi = 0.5; sigma = 0.5;
    one2np1 = range(1,N+1)

    sim = []
    fsim = [.0]*(N+1)
    for i in range(0,N+1):
      sim.append([.0]*(N+1))

    sim[0] = x0
    
    fsim[0] = func(x0)
    nonzdelt = 0.05
    zdelt = 0.00025
    for k in range(0,N):
        y = list(x0)
        if y[k] != 0:
            y[k] = (1+nonzdelt)*y[k]
        else:
            y[k] = zdelt

        sim[k+1] = y
        f = func(y)
        fsim[k+1] = f

    ind = sort_permutation(fsim)
    fsim = apply_permutation(fsim,ind)
    # sort so sim[0,:] has the lowest function value
    sim = apply_permutation(sim,ind)
    evaluator.x = sim[0]

    iterations = 1

     
    while (fcalls[0] < maxfun and iterations < maxiter):
        sim_size = max(map(lambda x : max(map(abs,map(operator.sub, x, sim[0]))),sim[1:]))
        #print "The simplex size is %.6g(tol=%.6g)"%(sim_size,xtol)
        fsim_size = max( map(lambda x: abs(x-fsim[0]), fsim[1:]))
        #print "The simplex image size is %.6g(tol=%.6g)"%(fsim_size, ftol)
        if ( sim_size <= xtol ) \
           and fsim_size <=ftol:
           break
#        if (max(numpy.ravel(abs(sim[1:]-sim[0]))) <= xtol \
#            and max(abs(fsim[0]-fsim[1:])) <= ftol):
#            break

        xbar = averageArrays(sim[:-1])
        xr = linearCombine((1+rho),xbar, - rho,sim[-1])
        fxr = func(xr)
        doshrink = 0

        if fxr < fsim[0]:
            xe = linearCombine((1+rho*chi),xbar, - rho*chi,sim[-1])
            fxe = func(xe)

            if fxe < fxr:
                sim[-1] = xe
                fsim[-1] = fxe
            else:
                sim[-1] = xr
                fsim[-1] = fxr
        else: # fsim[0] <= fxr
            if fxr < fsim[-2]:
                sim[-1] = xr
                fsim[-1] = fxr
            else: # fxr >= fsim[-2]
                # Perform contraction
                if fxr < fsim[-1]:
                    xc = linearCombine((1+psi*rho),xbar, - psi*rho,sim[-1])
                    fxc = func(xc)

                    if fxc <= fxr:
                        sim[-1] = xc
                        fsim[-1] = fxc
                    else:
                        doshrink=1
                else:
                    # Perform an inside contraction
                    xcc = linearCombine((1-psi),xbar,  psi,sim[-1])
                    fxcc = func(xcc)

                    if fxcc < fsim[-1]:
                        sim[-1] = xcc
                        fsim[-1] = fxcc
                    else:
                        doshrink = 1

                if doshrink:
                    for j in one2np1:
                        sim[j] = linearCombine((1-sigma),sim[0] , sigma,sim[j])
                        fsim[j] = func(sim[j])

        ind = sort_permutation(fsim)
        sim = apply_permutation(sim,ind)
        fsim = apply_permutation(fsim,ind)
        evaluator.x = sim[0]
        if callback is not None:
            callback(sim[0])
        iterations += 1

    x = sim[0]
    fval = min(fsim)
    warnflag = 0

    if fcalls[0] >= maxfun:
        warnflag = 1
        if disp:
            printOut("Warning: Maximum number of function evaluations has "\
                  "been exceeded.")
    elif iterations >= maxiter:
        warnflag = 2
        if disp:
            printOut("Warning: Maximum number of iterations has been exceeded")
    else:
        if disp:
            printOut("Optimization terminated successfully.")
            printOut("         Current function value: %f" % fval)
            printOut("         Iterations: %d" % iterations)
            printOut("         Function evaluations: %d" % fcalls[0])


    if full_output:
        retlist = x, fval, iterations, fcalls[0], warnflag
    else:
        retlist = x

    return retlist


