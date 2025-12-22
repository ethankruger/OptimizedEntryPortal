'use client';
import {
    memo,
    type ReactNode,
    useState,
    type ChangeEvent,
    type FormEvent,
    useEffect,
    useRef,
    forwardRef,
} from 'react';
import {
    motion,
    useAnimation,
    useInView,
    useMotionTemplate,
    useMotionValue,
} from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logoIcon from '../../assets/logo-logo.png';
import logoText from '../../assets/logo-text.png';

// ==================== Input Component ====================

const Input = memo(
    forwardRef(function Input(
        { className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>,
        ref: React.ForwardedRef<HTMLInputElement>
    ) {
        const radius = 100; // change this to increase the radius of the hover effect
        const [visible, setVisible] = useState(false);

        const mouseX = useMotionValue(0);
        const mouseY = useMotionValue(0);

        function handleMouseMove({
            currentTarget,
            clientX,
            clientY,
        }: React.MouseEvent<HTMLDivElement>) {
            const { left, top } = currentTarget.getBoundingClientRect();

            mouseX.set(clientX - left);
            mouseY.set(clientY - top);
        }

        return (
            <motion.div
                style={{
                    background: useMotionTemplate`
        radial-gradient(
          ${visible ? radius + 'px' : '0px'} circle at ${mouseX}px ${mouseY}px,
          #3b82f6,
          transparent 80%
        )
      `,
                }}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setVisible(true)}
                onMouseLeave={() => setVisible(false)}
                className='group/input rounded-lg p-[2px] transition duration-300'
            >
                <input
                    type={type}
                    className={cn(
                        `shadow-input dark:placeholder-text-neutral-600 flex h-10 w-full rounded-md border-none bg-gray-50 px-3 py-2 text-sm text-black transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600`,
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </motion.div>
        );
    })
);

Input.displayName = 'Input';

// ==================== BoxReveal Component ====================

type BoxRevealProps = {
    children: ReactNode;
    width?: string;
    boxColor?: string;
    duration?: number;
    overflow?: string;
    position?: string;
    className?: string;
};

const BoxReveal = memo(function BoxReveal({
    children,
    width = 'fit-content',
    boxColor,
    duration,
    overflow = 'hidden',
    position = 'relative',
    className,
}: BoxRevealProps) {
    const mainControls = useAnimation();
    const slideControls = useAnimation();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            slideControls.start('visible');
            mainControls.start('visible');
        } else {
            slideControls.start('hidden');
            mainControls.start('hidden');
        }
    }, [isInView, mainControls, slideControls]);

    return (
        <section
            ref={ref}
            style={{
                position: position as
                    | 'relative'
                    | 'absolute'
                    | 'fixed'
                    | 'sticky'
                    | 'static',
                width,
                overflow,
            }}
            className={className}
        >
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 },
                }}
                initial='hidden'
                animate={mainControls}
                transition={{ duration: duration ?? 0.5, delay: 0.25 }}
            >
                {children}
            </motion.div>
            <motion.div
                variants={{ hidden: { left: 0 }, visible: { left: '100%' } }}
                initial='hidden'
                animate={slideControls}
                transition={{ duration: duration ?? 0.5, ease: 'easeIn' }}
                style={{
                    position: 'absolute',
                    top: 4,
                    bottom: 4,
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    background: boxColor ?? '#5046e6',
                    borderRadius: 4,
                }}
            />
        </section>
    );
});

// ==================== Ripple Component ====================

type RippleProps = {
    mainCircleSize?: number;
    mainCircleOpacity?: number;
    numCircles?: number;
    className?: string;
};

const Ripple = memo(function Ripple({
    mainCircleSize = 210,
    mainCircleOpacity = 0.24,
    numCircles = 11,
    className = '',
}: RippleProps) {
    return (
        <section
            className={`max-w-[50%] absolute inset-0 flex items-center justify-center
        dark:bg-white/5 bg-neutral-50
        [mask-image:linear-gradient(to_bottom,black,transparent)]
        dark:[mask-image:linear-gradient(to_bottom,white,transparent)] ${className}`}
        >
            {Array.from({ length: numCircles }, (_, i) => {
                const size = mainCircleSize + i * 70;
                const opacity = mainCircleOpacity - i * 0.03;
                const animationDelay = `${i * 0.06}s`;
                const borderStyle = i === numCircles - 1 ? 'dashed' : 'solid';
                const borderOpacity = 5 + i * 5;

                return (
                    <span
                        key={i}
                        className='absolute animate-ripple rounded-full bg-foreground/15 border'
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            opacity: opacity,
                            animationDelay: animationDelay,
                            borderStyle: borderStyle,
                            borderWidth: '1px',
                            borderColor: `var(--foreground) dark:var(--background) / ${borderOpacity / 100
                                })`,
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                        }}
                    />
                );
            })}
        </section>
    );
});

// ==================== OrbitingCircles Component ====================

type OrbitingCirclesProps = {
    className?: string;
    children: ReactNode;
    reverse?: boolean;
    duration?: number;
    delay?: number;
    radius?: number;
    path?: boolean;
};

const OrbitingCircles = memo(function OrbitingCircles({
    className,
    children,
    reverse = false,
    duration = 20,
    delay = 10,
    radius = 50,
    path = true,
}: OrbitingCirclesProps) {
    return (
        <>
            {path && (
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    version='1.1'
                    className='pointer-events-none absolute inset-0 size-full'
                >
                    <circle
                        className='stroke-black/10 stroke-1 dark:stroke-white/10'
                        cx='50%'
                        cy='50%'
                        r={radius}
                        fill='none'
                    />
                </svg>
            )}
            <section
                style={
                    {
                        '--duration': duration,
                        '--radius': radius,
                        '--delay': -delay,
                    } as React.CSSProperties
                }
                className={cn(
                    'absolute flex size-full transform-gpu animate-orbit items-center justify-center rounded-full border bg-black/10 [animation-delay:calc(var(--delay)*1000ms)] dark:bg-white/10',
                    { '[animation-direction:reverse]': reverse },
                    className
                )}
            >
                {children}
            </section>
        </>
    );
});

// ==================== TechOrbitDisplay Component ====================

type IconConfig = {
    className?: string;
    duration?: number;
    delay?: number;
    radius?: number;
    path?: boolean;
    reverse?: boolean;
    component: () => React.ReactNode;
};

type TechnologyOrbitDisplayProps = {
    iconsArray: IconConfig[];
    text?: string;
};

const TechOrbitDisplay = memo(function TechOrbitDisplay({
    iconsArray,
    text = 'Animated Login',
}: TechnologyOrbitDisplayProps) {
    return (
        <section className='relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg'>
            <span className='pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-7xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10'>
                {text}
            </span>

            {iconsArray.map((icon, index) => (
                <OrbitingCircles
                    key={index}
                    className={icon.className}
                    duration={icon.duration}
                    delay={icon.delay}
                    radius={icon.radius}
                    path={icon.path}
                    reverse={icon.reverse}
                >
                    {icon.component()}
                </OrbitingCircles>
            ))}
        </section>
    );
});

// ==================== AnimatedForm Component ====================

type FieldType = 'text' | 'email' | 'password';

type Field = {
    label: string;
    required?: boolean;
    type: FieldType;
    placeholder?: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

type AnimatedFormProps = {
    header: string;
    subHeader?: string;
    fields: Field[];
    submitButton: string;
    textVariantButton?: string;
    errorField?: string;
    fieldPerRow?: number;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    goTo?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

type Errors = {
    [key: string]: string;
};

const AnimatedForm = memo(function AnimatedForm({
    header,
    subHeader,
    fields,
    submitButton,
    textVariantButton,
    errorField,
    fieldPerRow = 1,
    onSubmit,
    goTo,
}: AnimatedFormProps) {
    const [visible, setVisible] = useState<boolean>(false);
    const [errors, setErrors] = useState<Errors>({});

    const toggleVisibility = () => setVisible(!visible);

    const validateForm = (event: FormEvent<HTMLFormElement>) => {
        const currentErrors: Errors = {};
        fields.forEach((field) => {
            const value = (event.target as HTMLFormElement)[field.label]?.value;

            if (field.required && !value) {
                currentErrors[field.label] = `${field.label} is required`;
            }

            if (field.type === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
                currentErrors[field.label] = 'Invalid email address';
            }

            if (field.type === 'password' && value && value.length < 6) {
                currentErrors[field.label] =
                    'Password must be at least 6 characters long';
            }
        });
        return currentErrors;
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formErrors = validateForm(event);

        if (Object.keys(formErrors).length === 0) {
            onSubmit(event);
            console.log('Form submitted');
        } else {
            setErrors(formErrors);
        }
    };

    return (
        <section className='max-md:w-full flex flex-col gap-4 w-96 mx-auto'>
            <BoxReveal boxColor='var(--skeleton)' duration={0.3}>
                <h2 className='font-bold text-3xl text-neutral-800 dark:text-neutral-200'>
                    {header}
                </h2>
            </BoxReveal>

            {subHeader && (
                <BoxReveal boxColor='var(--skeleton)' duration={0.3} className='pb-2'>
                    <p className='text-neutral-600 text-sm max-w-sm dark:text-neutral-300'>
                        {subHeader}
                    </p>
                </BoxReveal>
            )}

            <form onSubmit={handleSubmit}>
                <section
                    className={`grid grid-cols-1 md:grid-cols-${fieldPerRow} mb-4`}
                >
                    {fields.map((field) => (
                        <section key={field.label} className='flex flex-col gap-2'>
                            <BoxReveal boxColor='var(--skeleton)' duration={0.3}>
                                <Label htmlFor={field.label}>
                                    {field.label} <span className='text-red-500'>*</span>
                                </Label>
                            </BoxReveal>

                            <BoxReveal
                                width='100%'
                                boxColor='var(--skeleton)'
                                duration={0.3}
                                className='flex flex-col space-y-2 w-full'
                            >
                                <section className='relative'>
                                    <Input
                                        type={
                                            field.type === 'password'
                                                ? visible
                                                    ? 'text'
                                                    : 'password'
                                                : field.type
                                        }
                                        id={field.label}
                                        placeholder={field.placeholder}
                                        onChange={field.onChange}
                                    />

                                    {field.type === 'password' && (
                                        <button
                                            type='button'
                                            onClick={toggleVisibility}
                                            className='absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5'
                                        >
                                            {visible ? (
                                                <Eye className='h-5 w-5' />
                                            ) : (
                                                <EyeOff className='h-5 w-5' />
                                            )}
                                        </button>
                                    )}
                                </section>

                                <section className='h-4'>
                                    {errors[field.label] && (
                                        <p className='text-red-500 text-xs'>
                                            {errors[field.label]}
                                        </p>
                                    )}
                                </section>
                            </BoxReveal>
                        </section>
                    ))}
                </section>

                <BoxReveal width='100%' boxColor='var(--skeleton)' duration={0.3}>
                    {errorField && (
                        <p className='text-red-500 text-sm mb-4'>{errorField}</p>
                    )}
                </BoxReveal>

                <BoxReveal
                    width='100%'
                    boxColor='var(--skeleton)'
                    duration={0.3}
                    overflow='visible'
                >
                    <button
                        className='bg-gradient-to-br relative group/btn from-zinc-200 dark:from-zinc-900
            dark:to-zinc-900 to-zinc-200 block dark:bg-zinc-800 w-full text-black
            dark:text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] 
              dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] outline-hidden hover:cursor-pointer'
                        type='submit'
                    >
                        {submitButton} &rarr;
                        <BottomGradient />
                    </button>
                </BoxReveal>

                {textVariantButton && goTo && (
                    <BoxReveal boxColor='var(--skeleton)' duration={0.3}>
                        <section className='mt-4 text-center hover:cursor-pointer'>
                            <button
                                className='text-sm text-blue-500 hover:cursor-pointer outline-hidden'
                                onClick={goTo}
                            >
                                {textVariantButton}
                            </button>
                        </section>
                    </BoxReveal>
                )}
            </form>
        </section>
    );
});

const BottomGradient = () => {
    return (
        <>
            <span className='group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent' />
            <span className='group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent' />
        </>
    );
};

// ==================== AuthTabs Component ====================

interface AuthTabsProps {
    formFields: {
        header: string;
        subHeader?: string;
        fields: Array<{
            label: string;
            required?: boolean;
            type: 'text' | 'email' | 'password';
            placeholder: string;
            onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
        }>;
        submitButton: string;
        textVariantButton?: string;
    };
    goTo: (event: React.MouseEvent<HTMLButtonElement>) => void;
    handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const AuthTabs = memo(function AuthTabs({
    formFields,
    goTo,
    handleSubmit,
}: AuthTabsProps) {
    return (
        <div className='flex max-lg:justify-center w-full md:w-auto'>
            {/* Right Side */}
            <div className='w-full lg:w-1/2 h-[100dvh] flex flex-col justify-center items-center max-lg:px-[10%]'>
                <AnimatedForm
                    {...formFields}
                    fieldPerRow={1}
                    onSubmit={handleSubmit}
                    goTo={goTo}
                />
            </div>
        </div>
    );
});

// ==================== Label Component ====================

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    htmlFor?: string;
}

const Label = memo(function Label({ className, ...props }: LabelProps) {
    return (
        <label
            className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                className
            )}
            {...props}
        />
    );
});

// ==================== Exports ====================

export {
    Input,
    BoxReveal,
    Ripple,
    OrbitingCircles,
    TechOrbitDisplay,
    AnimatedForm,
    AuthTabs,
    Label,
    BottomGradient,
};


interface OrbitIcon {
    component: () => ReactNode;
    className: string;
    duration?: number;
    delay?: number;
    radius?: number;
    path?: boolean;
    reverse?: boolean;
}

const iconsArray: OrbitIcon[] = [
    {
        component: () => (
            <img
                className="w-full h-full object-contain"
                src={logoIcon}
                alt='Logo'
            />
        ),
        className: 'size-[50px] border-none bg-transparent',
        radius: 100,
        duration: 20,
        path: false,
        reverse: false,
    },
    {
        component: () => (
            <img
                className="w-full h-full object-contain"
                src={logoText}
                alt='Logo Text'
            />
        ),
        className: 'size-[50px] border-none bg-transparent',
        radius: 100,
        duration: 20,
        delay: 10,
        path: false,
        reverse: true,
    },
    {
        component: () => (
            <img
                className="w-full h-full object-contain"
                src={logoIcon}
                alt='Logo'
            />
        ),
        className: 'size-[60px] border-none bg-transparent',
        radius: 150,
        duration: 25,
        path: false,
        reverse: false,
    },
    {
        component: () => (
            <img
                className="w-full h-full object-contain"
                src={logoText}
                alt='Logo Text'
            />
        ),
        className: 'size-[60px] border-none bg-transparent',
        radius: 150,
        duration: 25,
        delay: 12,
        path: false,
        reverse: true,
    },
    {
        component: () => (
            <img
                className="w-full h-full object-contain"
                src={logoIcon}
                alt='Logo'
            />
        ),
        className: 'size-[70px] border-none bg-transparent',
        radius: 200,
        duration: 30,
        path: false,
        reverse: false,
    },
    {
        component: () => (
            <img
                className="w-full h-full object-contain"
                src={logoText}
                alt='Logo Text'
            />
        ),
        className: 'size-[70px] border-none bg-transparent',
        radius: 200,
        duration: 30,
        delay: 15,
        path: false,
        reverse: true,
    },
    {
        component: () => (
            <img
                className="w-full h-full object-contain"
                src={logoIcon}
                alt='Logo'
            />
        ),
        className: 'size-[80px] border-none bg-transparent',
        radius: 250,
        duration: 35,
        path: false,
        reverse: false,
    },
];

export function LoginPage() {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const goToForgotPassword = (
        event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
    ) => {
        event.preventDefault();
        console.log('forgot password');
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Prevent default form submission which causes reload
        try {
            await signIn(email, password);
            navigate('/');
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const formFields = {
        header: 'Optimized Entry Portal',
        subHeader: 'Sign in to your account',
        fields: [
            {
                label: 'Email',
                required: true,
                type: 'email' as const,
                placeholder: 'Enter your email address',
                onChange: (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
            },
            {
                label: 'Password',
                required: true,
                type: 'password' as const,
                placeholder: 'Enter your password',
                onChange: (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
            },
        ],
        submitButton: 'Sign in',
        textVariantButton: 'Forgot password?',
    };

    return (
        <section className='flex h-screen w-full bg-background text-foreground overflow-hidden items-center justify-center p-4 sm:p-0'>
            {/* Left Side */}
            <span className='flex flex-col justify-center items-center w-1/2 max-lg:hidden relative border-r border-border h-full bg-gradient-to-br from-[#30b357]/20 via-black/5 to-[#ff8904]/20 dark:from-[#30b357]/10 dark:via-white/5 dark:to-[#ff8904]/10'>
                <Ripple mainCircleSize={150} />
                <TechOrbitDisplay iconsArray={iconsArray} text="Welcome Back to the Optimized Entry Dashboard" />
            </span>

            {/* Right Side */}
            <span className='w-1/2 h-full flex flex-col justify-center items-center max-lg:w-full max-lg:px-[5%]'>
                <AuthTabs
                    formFields={formFields}
                    goTo={goToForgotPassword}
                    handleSubmit={handleSubmit}
                />
            </span>
        </section>
    );
}
