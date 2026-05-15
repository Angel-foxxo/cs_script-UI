public static class Templates
{
    public const string FONT_DEFINITIONS =
@"_HEADER_TEXT_

import { Font } from ""./font"";

export enum Fonts
{
_FONT_ENUM_LIST_
}

export const FontsMap: Map<Fonts, Font> = new Map<Fonts, Font>();

export const CharToGlyphs: Map<number, number> = new Map<number, number>();

/** 
 * Returns the index of the char's glpyh in the Glyphs array
 */
export function GetGlyphIndex(ch: string): number
{
    return CharToGlyphs.get(ch.charCodeAt(0)) ?? 0;
}

_FONT_CLASSES_
_FONT_MAP_ENTRIES_
_CHAR_TO_GLYPHS_
";

    public const string FONT_CLASS =
@"export const _FONT_NAME_: Font = new Font(""_FONT_NAME_"", _LINE_HEIGHT_, [
_FONT_METRICS_
]);
";

    public const string FONT_METRIC =
@"    { pixelW:_WIDTH_, pixelH:_HEIGHT_, advance:_ADVANCE_ }, // '_CHAR_'";

    public const string VTEX =
@"<!-- dmx encoding keyvalues2_noids 1 format vtex 1 -->
""CDmeVtex""
{
    ""m_inputTextureArray"" ""element_array""
    [
        ""CDmeInputTexture""
        {
            ""m_name"" ""string"" ""InputTexture0""
            ""m_fileName"" ""string"" ""_FILE_NAME_""
            ""m_colorSpace"" ""string"" ""srgb""
            ""m_typeString"" ""string"" ""2D""
            ""m_imageProcessorArray"" ""element_array""
            [
                ""CDmeImageProcessor""
                {
                    ""m_algorithm"" ""string"" ""None""
                    ""m_stringArg"" ""string"" """"
                    ""m_vFloat4Arg"" ""vector4"" ""0 0 0 0""
                }
            ]
        }
    ]
    ""m_outputTypeString"" ""string"" ""2D""
    ""m_outputFormat"" ""string"" ""DXT5""
    ""m_outputClearColor"" ""vector4"" ""0 0 0 0""
    ""m_nOutputMinDimension"" ""int"" ""0""
    ""m_nOutputMaxDimension"" ""int"" ""0""
    ""m_textureOutputChannelArray"" ""element_array""
    [
        ""CDmeTextureOutputChannel""
        {
            ""m_inputTextureArray"" ""string_array"" [ ""InputTexture0"" ]
            ""m_srcChannels"" ""string"" ""rgba""
            ""m_dstChannels"" ""string"" ""rgba""
            ""m_mipAlgorithm"" ""CDmeImageProcessor""
            {
                ""m_algorithm"" ""string"" ""Box""
                ""m_stringArg"" ""string"" """"
                ""m_vFloat4Arg"" ""vector4"" ""0 0 0 0""
            }
            ""m_outputColorSpace"" ""string"" ""srgb""
        }
    ]
    ""m_vClamp"" ""vector3"" ""0 0 0""
    ""m_bNoLod"" ""bool"" ""0""
}";

    public const string FONT_PARTICLE =
@"<!-- kv3 encoding:text:version{e21c7f3c-8a33-41c5-9977-a76d3a32aa0d} format:vpcf65:version{48e806a9-c210-4cd8-811a-38b5ef63b195} -->
{
	_class = ""CParticleSystemDefinition""
	m_nBehaviorVersion = 12
	m_bInfiniteBounds = true
	m_nMaxParticles = 1
	m_controlPointConfigurations = 
	[
		{
			m_name = ""preview""
			m_drivers = 
			[
				{
					m_iAttachType = ""PATTACH_WORLDORIGIN""
					m_entityName = ""self""
				},
				{
					m_iControlPoint = 1
					m_iAttachType = ""PATTACH_WORLDORIGIN""
					m_vecOffset = [ 255.0, 255.0, 255.0 ]
					m_entityName = ""self""
				},
				{
					m_iControlPoint = 2
					m_iAttachType = ""PATTACH_WORLDORIGIN""
					m_vecOffset = [ 1.0, 255.0, 2.0 ]
					m_entityName = ""self""
				},
			]
		},
	]
	m_PreEmissionOperators = 
	[
		{
			_class = ""C_OP_SetControlPointOrientation""
			m_nCP = 0
		},
	]
	m_Emitters = 
	[
		{
			_class = ""C_OP_InstantaneousEmitter""
			m_nParticlesToEmit = 
			{
				m_nType = ""PF_TYPE_LITERAL""
				m_nMapType = ""PF_MAP_TYPE_DIRECT""
				m_flLiteralValue = 1.0
				m_NamedValue = """"
				m_nControlPoint = 0
				m_nScalarAttribute = 3
				m_nVectorAttribute = 6
				m_nVectorComponent = 0
				m_bReverseOrder = false
				m_flRandomMin = 0.0
				m_flRandomMax = 1.0
				m_bHasRandomSignFlip = false
				m_nRandomSeed = -1
				m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
				m_strSnapshotSubset = """"
				m_flLOD0 = 0.0
				m_flLOD1 = 0.0
				m_flLOD2 = 0.0
				m_flLOD3 = 0.0
				m_nNoiseInputVectorAttribute = 0
				m_flNoiseOutputMin = 0.0
				m_flNoiseOutputMax = 1.0
				m_flNoiseScale = 0.1
				m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
				m_flNoiseOffset = 0.0
				m_nNoiseOctaves = 1
				m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
				m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
				m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
				m_flNoiseTurbulenceScale = 1.0
				m_flNoiseTurbulenceMix = 0.5
				m_flNoiseImgPreviewScale = 1.0
				m_bNoiseImgPreviewLive = true
				m_flNoCameraFallback = 0.0
				m_bUseBoundsCenter = false
				m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
				m_flMultFactor = 1.0
				m_flInput0 = 0.0
				m_flInput1 = 1.0
				m_flOutput0 = 0.0
				m_flOutput1 = 1.0
				m_flNotchedRangeMin = 0.0
				m_flNotchedRangeMax = 1.0
				m_flNotchedOutputOutside = 0.0
				m_flNotchedOutputInside = 1.0
				m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
				m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
				m_flBiasParameter = 0.0
				m_Curve = 
				{
					m_spline = [  ]
					m_tangents = [  ]
					m_vDomainMins = [ 0.0, 0.0 ]
					m_vDomainMaxs = [ 0.0, 0.0 ]
				}
			}
		},
	]
	m_Initializers = 
	[
		{
			_class = ""C_INIT_InitFloat""
			m_InputValue = 
			{
				m_nType = ""PF_TYPE_LITERAL""
				m_nMapType = ""PF_MAP_TYPE_DIRECT""
				m_flLiteralValue = 1.0
				m_NamedValue = """"
				m_nControlPoint = 0
				m_nScalarAttribute = 3
				m_nVectorAttribute = 6
				m_nVectorComponent = 0
				m_bReverseOrder = false
				m_flRandomMin = 1.0
				m_flRandomMax = 1.0
				m_bHasRandomSignFlip = false
				m_nRandomSeed = -1
				m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
				m_strSnapshotSubset = """"
				m_flLOD0 = 0.0
				m_flLOD1 = 0.0
				m_flLOD2 = 0.0
				m_flLOD3 = 0.0
				m_nNoiseInputVectorAttribute = 0
				m_flNoiseOutputMin = 0.0
				m_flNoiseOutputMax = 1.0
				m_flNoiseScale = 0.1
				m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
				m_flNoiseOffset = 0.0
				m_nNoiseOctaves = 1
				m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
				m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
				m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
				m_flNoiseTurbulenceScale = 1.0
				m_flNoiseTurbulenceMix = 0.5
				m_flNoiseImgPreviewScale = 1.0
				m_bNoiseImgPreviewLive = true
				m_flNoCameraFallback = 0.0
				m_bUseBoundsCenter = false
				m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
				m_flMultFactor = 1.0
				m_flInput0 = 0.0
				m_flInput1 = 1.0
				m_flOutput0 = 0.0
				m_flOutput1 = 1.0
				m_flNotchedRangeMin = 0.0
				m_flNotchedRangeMax = 1.0
				m_flNotchedOutputOutside = 0.0
				m_flNotchedOutputInside = 1.0
				m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
				m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
				m_flBiasParameter = 0.0
				m_Curve = 
				{
					m_spline = [  ]
					m_tangents = [  ]
					m_vDomainMins = [ 0.0, 0.0 ]
					m_vDomainMaxs = [ 0.0, 0.0 ]
				}
			}
		},
		{
			_class = ""C_INIT_InitFloat""
			m_InputValue = 
			{
				m_nType = ""PF_TYPE_LITERAL""
				m_nMapType = ""PF_MAP_TYPE_DIRECT""
				m_flLiteralValue = 2.0
				m_NamedValue = """"
				m_nControlPoint = 0
				m_nScalarAttribute = 3
				m_nVectorAttribute = 6
				m_nVectorComponent = 0
				m_bReverseOrder = false
				m_flRandomMin = 0.1
				m_flRandomMax = 0.1
				m_bHasRandomSignFlip = false
				m_nRandomSeed = -1
				m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
				m_strSnapshotSubset = """"
				m_flLOD0 = 0.0
				m_flLOD1 = 0.0
				m_flLOD2 = 0.0
				m_flLOD3 = 0.0
				m_nNoiseInputVectorAttribute = 0
				m_flNoiseOutputMin = 0.0
				m_flNoiseOutputMax = 1.0
				m_flNoiseScale = 0.1
				m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
				m_flNoiseOffset = 0.0
				m_nNoiseOctaves = 1
				m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
				m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
				m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
				m_flNoiseTurbulenceScale = 1.0
				m_flNoiseTurbulenceMix = 0.5
				m_flNoiseImgPreviewScale = 1.0
				m_bNoiseImgPreviewLive = true
				m_flNoCameraFallback = 0.0
				m_bUseBoundsCenter = false
				m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
				m_flMultFactor = 1.0
				m_flInput0 = 0.0
				m_flInput1 = 1.0
				m_flOutput0 = 0.0
				m_flOutput1 = 1.0
				m_flNotchedRangeMin = 0.0
				m_flNotchedRangeMax = 1.0
				m_flNotchedOutputOutside = 0.0
				m_flNotchedOutputInside = 1.0
				m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
				m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
				m_flBiasParameter = 0.0
				m_Curve = 
				{
					m_spline = [  ]
					m_tangents = [  ]
					m_vDomainMins = [ 0.0, 0.0 ]
					m_vDomainMaxs = [ 0.0, 0.0 ]
				}
			}
			m_nOutputField = 10
		},
		{
			_class = ""C_INIT_RandomSequence""
			m_flOpTimeOffsetMax = 1.0
			m_nSequenceMax = 3
		},
	]
	m_Operators = 
	[
		{
			_class = ""C_OP_SetAttributeToScalarExpression""
			m_nExpression = ""SCALAR_EXPRESSION_MUL""
			m_flInput1 = 
			{
				m_nType = ""PF_TYPE_CONTROL_POINT_COMPONENT""
				m_nMapType = ""PF_MAP_TYPE_DIRECT""
				m_flLiteralValue = 0.0
				m_NamedValue = """"
				m_nControlPoint = 3
				m_nScalarAttribute = 3
				m_nVectorAttribute = 6
				m_nVectorComponent = 0
				m_bReverseOrder = false
				m_flRandomMin = 0.0
				m_flRandomMax = 1.0
				m_bHasRandomSignFlip = false
				m_nRandomSeed = -1
				m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
				m_strSnapshotSubset = """"
				m_flLOD0 = 0.0
				m_flLOD1 = 0.0
				m_flLOD2 = 0.0
				m_flLOD3 = 0.0
				m_nNoiseInputVectorAttribute = 0
				m_flNoiseOutputMin = 0.0
				m_flNoiseOutputMax = 1.0
				m_flNoiseScale = 0.1
				m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
				m_flNoiseOffset = 0.0
				m_nNoiseOctaves = 1
				m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
				m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
				m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
				m_flNoiseTurbulenceScale = 1.0
				m_flNoiseTurbulenceMix = 0.5
				m_flNoiseImgPreviewScale = 1.0
				m_bNoiseImgPreviewLive = true
				m_flNoCameraFallback = 0.0
				m_bUseBoundsCenter = false
				m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
				m_flMultFactor = 1.0
				m_flInput0 = 0.0
				m_flInput1 = 1.0
				m_flOutput0 = 0.0
				m_flOutput1 = 1.0
				m_flNotchedRangeMin = 0.0
				m_flNotchedRangeMax = 1.0
				m_flNotchedOutputOutside = 0.0
				m_flNotchedOutputInside = 1.0
				m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
				m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
				m_flBiasParameter = 0.0
				m_Curve = 
				{
					m_spline = [  ]
					m_tangents = [  ]
					m_vDomainMins = [ 0.0, 0.0 ]
					m_vDomainMaxs = [ 0.0, 0.0 ]
				}
			}
			m_flInput2 = 
			{
				m_nType = ""PF_TYPE_LITERAL""
				m_nMapType = ""PF_MAP_TYPE_DIRECT""
				m_flLiteralValue = 1.0
				m_NamedValue = """"
				m_nControlPoint = 0
				m_nScalarAttribute = 3
				m_nVectorAttribute = 6
				m_nVectorComponent = 0
				m_bReverseOrder = false
				m_flRandomMin = 0.0
				m_flRandomMax = 1.0
				m_bHasRandomSignFlip = false
				m_nRandomSeed = -1
				m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
				m_strSnapshotSubset = """"
				m_flLOD0 = 0.0
				m_flLOD1 = 0.0
				m_flLOD2 = 0.0
				m_flLOD3 = 0.0
				m_nNoiseInputVectorAttribute = 0
				m_flNoiseOutputMin = 0.0
				m_flNoiseOutputMax = 1.0
				m_flNoiseScale = 0.1
				m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
				m_flNoiseOffset = 0.0
				m_nNoiseOctaves = 1
				m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
				m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
				m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
				m_flNoiseTurbulenceScale = 1.0
				m_flNoiseTurbulenceMix = 0.5
				m_flNoiseImgPreviewScale = 1.0
				m_bNoiseImgPreviewLive = true
				m_flNoCameraFallback = 0.0
				m_bUseBoundsCenter = false
				m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
				m_flMultFactor = 1.0
				m_flInput0 = 0.0
				m_flInput1 = 1.0
				m_flOutput0 = 0.0
				m_flOutput1 = 1.0
				m_flNotchedRangeMin = 0.0
				m_flNotchedRangeMax = 1.0
				m_flNotchedOutputOutside = 0.0
				m_flNotchedOutputInside = 1.0
				m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
				m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
				m_flBiasParameter = 0.0
				m_Curve = 
				{
					m_spline = [  ]
					m_tangents = [  ]
					m_vDomainMins = [ 0.0, 0.0 ]
					m_vDomainMaxs = [ 0.0, 0.0 ]
				}
			}
			m_nOutputField = 10
		},
		{
			_class = ""C_OP_SetAttributeToScalarExpression""
			m_nExpression = ""SCALAR_EXPRESSION_MUL""
			m_flInput1 = 
			{
				m_nType = ""PF_TYPE_CONTROL_POINT_COMPONENT""
				m_nMapType = ""PF_MAP_TYPE_DIRECT""
				m_flLiteralValue = 0.0
				m_NamedValue = """"
				m_nControlPoint = 3
				m_nScalarAttribute = 3
				m_nVectorAttribute = 6
				m_nVectorComponent = 1
				m_bReverseOrder = false
				m_flRandomMin = 0.0
				m_flRandomMax = 1.0
				m_bHasRandomSignFlip = false
				m_nRandomSeed = -1
				m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
				m_strSnapshotSubset = """"
				m_flLOD0 = 0.0
				m_flLOD1 = 0.0
				m_flLOD2 = 0.0
				m_flLOD3 = 0.0
				m_nNoiseInputVectorAttribute = 0
				m_flNoiseOutputMin = 0.0
				m_flNoiseOutputMax = 1.0
				m_flNoiseScale = 0.1
				m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
				m_flNoiseOffset = 0.0
				m_nNoiseOctaves = 1
				m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
				m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
				m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
				m_flNoiseTurbulenceScale = 1.0
				m_flNoiseTurbulenceMix = 0.5
				m_flNoiseImgPreviewScale = 1.0
				m_bNoiseImgPreviewLive = true
				m_flNoCameraFallback = 0.0
				m_bUseBoundsCenter = false
				m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
				m_flMultFactor = 1.0
				m_flInput0 = 0.0
				m_flInput1 = 1.0
				m_flOutput0 = 0.0
				m_flOutput1 = 1.0
				m_flNotchedRangeMin = 0.0
				m_flNotchedRangeMax = 1.0
				m_flNotchedOutputOutside = 0.0
				m_flNotchedOutputInside = 1.0
				m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
				m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
				m_flBiasParameter = 0.0
				m_Curve = 
				{
					m_spline = [  ]
					m_tangents = [  ]
					m_vDomainMins = [ 0.0, 0.0 ]
					m_vDomainMaxs = [ 0.0, 0.0 ]
				}
			}
			m_flInput2 = 
			{
				m_nType = ""PF_TYPE_LITERAL""
				m_nMapType = ""PF_MAP_TYPE_DIRECT""
				m_flLiteralValue = 0.5
				m_NamedValue = """"
				m_nControlPoint = 0
				m_nScalarAttribute = 3
				m_nVectorAttribute = 6
				m_nVectorComponent = 0
				m_bReverseOrder = false
				m_flRandomMin = 0.0
				m_flRandomMax = 1.0
				m_bHasRandomSignFlip = false
				m_nRandomSeed = -1
				m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
				m_strSnapshotSubset = """"
				m_flLOD0 = 0.0
				m_flLOD1 = 0.0
				m_flLOD2 = 0.0
				m_flLOD3 = 0.0
				m_nNoiseInputVectorAttribute = 0
				m_flNoiseOutputMin = 0.0
				m_flNoiseOutputMax = 1.0
				m_flNoiseScale = 0.1
				m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
				m_flNoiseOffset = 0.0
				m_nNoiseOctaves = 1
				m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
				m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
				m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
				m_flNoiseTurbulenceScale = 1.0
				m_flNoiseTurbulenceMix = 0.5
				m_flNoiseImgPreviewScale = 1.0
				m_bNoiseImgPreviewLive = true
				m_flNoCameraFallback = 0.0
				m_bUseBoundsCenter = false
				m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
				m_flMultFactor = 1.0
				m_flInput0 = 0.0
				m_flInput1 = 1.0
				m_flOutput0 = 0.0
				m_flOutput1 = 1.0
				m_flNotchedRangeMin = 0.0
				m_flNotchedRangeMax = 1.0
				m_flNotchedOutputOutside = 0.0
				m_flNotchedOutputInside = 1.0
				m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
				m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
				m_flBiasParameter = 0.0
				m_Curve = 
				{
					m_spline = [  ]
					m_tangents = [  ]
					m_vDomainMins = [ 0.0, 0.0 ]
					m_vDomainMaxs = [ 0.0, 0.0 ]
				}
			}
		},
		{
			_class = ""C_OP_SetCPtoVector""
		},
		{
			_class = ""C_OP_SetVectorAttributeToVectorExpression""
			m_vInput1 = 
			{
				m_nType = ""PVEC_TYPE_CP_RELATIVE_DIR""
				m_vLiteralValue = [ -1.0, 0.0, 0.0 ]
				m_LiteralColor = [ 0, 0, 0 ]
				m_NamedValue = """"
				m_bFollowNamedValue = false
				m_nVectorAttribute = 0
				m_vVectorAttributeScale = [ 1.0, 1.0, 1.0 ]
				m_nControlPoint = 0
				m_nDeltaControlPoint = 0
				m_vCPValueScale = [ 1.0, 1.0, 1.0 ]
				m_vCPRelativePosition = [ 1.0, 0.0, 0.0 ]
				m_vCPRelativeDir = [ 0.0, 0.0, -1.0 ]
				m_FloatComponentX = 
				{
					m_nType = ""PF_TYPE_LITERAL""
					m_nMapType = ""PF_MAP_TYPE_DIRECT""
					m_flLiteralValue = 0.0
					m_NamedValue = """"
					m_nControlPoint = 0
					m_nScalarAttribute = 3
					m_nVectorAttribute = 6
					m_nVectorComponent = 0
					m_bReverseOrder = false
					m_flRandomMin = 0.0
					m_flRandomMax = 1.0
					m_bHasRandomSignFlip = false
					m_nRandomSeed = -1
					m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
					m_strSnapshotSubset = """"
					m_flLOD0 = 0.0
					m_flLOD1 = 0.0
					m_flLOD2 = 0.0
					m_flLOD3 = 0.0
					m_nNoiseInputVectorAttribute = 0
					m_flNoiseOutputMin = 0.0
					m_flNoiseOutputMax = 1.0
					m_flNoiseScale = 0.1
					m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
					m_flNoiseOffset = 0.0
					m_nNoiseOctaves = 1
					m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
					m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
					m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
					m_flNoiseTurbulenceScale = 1.0
					m_flNoiseTurbulenceMix = 0.5
					m_flNoiseImgPreviewScale = 1.0
					m_bNoiseImgPreviewLive = true
					m_flNoCameraFallback = 0.0
					m_bUseBoundsCenter = false
					m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
					m_flMultFactor = 1.0
					m_flInput0 = 0.0
					m_flInput1 = 1.0
					m_flOutput0 = 0.0
					m_flOutput1 = 1.0
					m_flNotchedRangeMin = 0.0
					m_flNotchedRangeMax = 1.0
					m_flNotchedOutputOutside = 0.0
					m_flNotchedOutputInside = 1.0
					m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
					m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
					m_flBiasParameter = 0.0
					m_Curve = 
					{
						m_spline = [  ]
						m_tangents = [  ]
						m_vDomainMins = [ 0.0, 0.0 ]
						m_vDomainMaxs = [ 0.0, 0.0 ]
					}
				}
				m_FloatComponentY = 
				{
					m_nType = ""PF_TYPE_LITERAL""
					m_nMapType = ""PF_MAP_TYPE_DIRECT""
					m_flLiteralValue = 0.0
					m_NamedValue = """"
					m_nControlPoint = 0
					m_nScalarAttribute = 3
					m_nVectorAttribute = 6
					m_nVectorComponent = 0
					m_bReverseOrder = false
					m_flRandomMin = 0.0
					m_flRandomMax = 1.0
					m_bHasRandomSignFlip = false
					m_nRandomSeed = -1
					m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
					m_strSnapshotSubset = """"
					m_flLOD0 = 0.0
					m_flLOD1 = 0.0
					m_flLOD2 = 0.0
					m_flLOD3 = 0.0
					m_nNoiseInputVectorAttribute = 0
					m_flNoiseOutputMin = 0.0
					m_flNoiseOutputMax = 1.0
					m_flNoiseScale = 0.1
					m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
					m_flNoiseOffset = 0.0
					m_nNoiseOctaves = 1
					m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
					m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
					m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
					m_flNoiseTurbulenceScale = 1.0
					m_flNoiseTurbulenceMix = 0.5
					m_flNoiseImgPreviewScale = 1.0
					m_bNoiseImgPreviewLive = true
					m_flNoCameraFallback = 0.0
					m_bUseBoundsCenter = false
					m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
					m_flMultFactor = 1.0
					m_flInput0 = 0.0
					m_flInput1 = 1.0
					m_flOutput0 = 0.0
					m_flOutput1 = 1.0
					m_flNotchedRangeMin = 0.0
					m_flNotchedRangeMax = 1.0
					m_flNotchedOutputOutside = 0.0
					m_flNotchedOutputInside = 1.0
					m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
					m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
					m_flBiasParameter = 0.0
					m_Curve = 
					{
						m_spline = [  ]
						m_tangents = [  ]
						m_vDomainMins = [ 0.0, 0.0 ]
						m_vDomainMaxs = [ 0.0, 0.0 ]
					}
				}
				m_FloatComponentZ = 
				{
					m_nType = ""PF_TYPE_LITERAL""
					m_nMapType = ""PF_MAP_TYPE_DIRECT""
					m_flLiteralValue = 0.0
					m_NamedValue = """"
					m_nControlPoint = 0
					m_nScalarAttribute = 3
					m_nVectorAttribute = 6
					m_nVectorComponent = 0
					m_bReverseOrder = false
					m_flRandomMin = 0.0
					m_flRandomMax = 1.0
					m_bHasRandomSignFlip = false
					m_nRandomSeed = -1
					m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
					m_strSnapshotSubset = """"
					m_flLOD0 = 0.0
					m_flLOD1 = 0.0
					m_flLOD2 = 0.0
					m_flLOD3 = 0.0
					m_nNoiseInputVectorAttribute = 0
					m_flNoiseOutputMin = 0.0
					m_flNoiseOutputMax = 1.0
					m_flNoiseScale = 0.1
					m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
					m_flNoiseOffset = 0.0
					m_nNoiseOctaves = 1
					m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
					m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
					m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
					m_flNoiseTurbulenceScale = 1.0
					m_flNoiseTurbulenceMix = 0.5
					m_flNoiseImgPreviewScale = 1.0
					m_bNoiseImgPreviewLive = true
					m_flNoCameraFallback = 0.0
					m_bUseBoundsCenter = false
					m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
					m_flMultFactor = 1.0
					m_flInput0 = 0.0
					m_flInput1 = 1.0
					m_flOutput0 = 0.0
					m_flOutput1 = 1.0
					m_flNotchedRangeMin = 0.0
					m_flNotchedRangeMax = 1.0
					m_flNotchedOutputOutside = 0.0
					m_flNotchedOutputInside = 1.0
					m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
					m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
					m_flBiasParameter = 0.0
					m_Curve = 
					{
						m_spline = [  ]
						m_tangents = [  ]
						m_vDomainMins = [ 0.0, 0.0 ]
						m_vDomainMaxs = [ 0.0, 0.0 ]
					}
				}
				m_FloatInterp = 
				{
					m_nType = ""PF_TYPE_LITERAL""
					m_nMapType = ""PF_MAP_TYPE_DIRECT""
					m_flLiteralValue = 0.0
					m_NamedValue = """"
					m_nControlPoint = 0
					m_nScalarAttribute = 3
					m_nVectorAttribute = 6
					m_nVectorComponent = 0
					m_bReverseOrder = false
					m_flRandomMin = 0.0
					m_flRandomMax = 1.0
					m_bHasRandomSignFlip = false
					m_nRandomSeed = -1
					m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
					m_strSnapshotSubset = """"
					m_flLOD0 = 0.0
					m_flLOD1 = 0.0
					m_flLOD2 = 0.0
					m_flLOD3 = 0.0
					m_nNoiseInputVectorAttribute = 0
					m_flNoiseOutputMin = 0.0
					m_flNoiseOutputMax = 1.0
					m_flNoiseScale = 0.1
					m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
					m_flNoiseOffset = 0.0
					m_nNoiseOctaves = 1
					m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
					m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
					m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
					m_flNoiseTurbulenceScale = 1.0
					m_flNoiseTurbulenceMix = 0.5
					m_flNoiseImgPreviewScale = 1.0
					m_bNoiseImgPreviewLive = true
					m_flNoCameraFallback = 0.0
					m_bUseBoundsCenter = false
					m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
					m_flMultFactor = 1.0
					m_flInput0 = 0.0
					m_flInput1 = 1.0
					m_flOutput0 = 0.0
					m_flOutput1 = 1.0
					m_flNotchedRangeMin = 0.0
					m_flNotchedRangeMax = 1.0
					m_flNotchedOutputOutside = 0.0
					m_flNotchedOutputInside = 1.0
					m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
					m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
					m_flBiasParameter = 0.0
					m_Curve = 
					{
						m_spline = [  ]
						m_tangents = [  ]
						m_vDomainMins = [ 0.0, 0.0 ]
						m_vDomainMaxs = [ 0.0, 0.0 ]
					}
				}
				m_flInterpInput0 = 0.0
				m_flInterpInput1 = 1.0
				m_vInterpOutput0 = [ 0.0, 0.0, 0.0 ]
				m_vInterpOutput1 = [ 1.0, 1.0, 1.0 ]
				m_Gradient = 
				{
					m_Stops = [  ]
				}
				m_vRandomMin = [ 0.0, 0.0, 0.0 ]
				m_vRandomMax = [ 0.0, 0.0, 0.0 ]
			}
			m_vInput2 = 
			{
				m_nType = ""PVEC_TYPE_PARTICLE_VECTOR""
				m_vLiteralValue = [ 0.0, 0.0, 0.0 ]
				m_LiteralColor = [ 0, 0, 0 ]
				m_NamedValue = """"
				m_bFollowNamedValue = false
				m_nVectorAttribute = 0
				m_vVectorAttributeScale = [ 1.0, 1.0, 1.0 ]
				m_nControlPoint = 0
				m_nDeltaControlPoint = 0
				m_vCPValueScale = [ 1.0, 1.0, 1.0 ]
				m_vCPRelativePosition = [ 0.0, 0.0, 0.0 ]
				m_vCPRelativeDir = [ 1.0, 0.0, 0.0 ]
				m_FloatComponentX = 
				{
					m_nType = ""PF_TYPE_LITERAL""
					m_nMapType = ""PF_MAP_TYPE_DIRECT""
					m_flLiteralValue = 0.0
					m_NamedValue = """"
					m_nControlPoint = 0
					m_nScalarAttribute = 3
					m_nVectorAttribute = 6
					m_nVectorComponent = 0
					m_bReverseOrder = false
					m_flRandomMin = 0.0
					m_flRandomMax = 1.0
					m_bHasRandomSignFlip = false
					m_nRandomSeed = -1
					m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
					m_strSnapshotSubset = """"
					m_flLOD0 = 0.0
					m_flLOD1 = 0.0
					m_flLOD2 = 0.0
					m_flLOD3 = 0.0
					m_nNoiseInputVectorAttribute = 0
					m_flNoiseOutputMin = 0.0
					m_flNoiseOutputMax = 1.0
					m_flNoiseScale = 0.1
					m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
					m_flNoiseOffset = 0.0
					m_nNoiseOctaves = 1
					m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
					m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
					m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
					m_flNoiseTurbulenceScale = 1.0
					m_flNoiseTurbulenceMix = 0.5
					m_flNoiseImgPreviewScale = 1.0
					m_bNoiseImgPreviewLive = true
					m_flNoCameraFallback = 0.0
					m_bUseBoundsCenter = false
					m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
					m_flMultFactor = 1.0
					m_flInput0 = 0.0
					m_flInput1 = 1.0
					m_flOutput0 = 0.0
					m_flOutput1 = 1.0
					m_flNotchedRangeMin = 0.0
					m_flNotchedRangeMax = 1.0
					m_flNotchedOutputOutside = 0.0
					m_flNotchedOutputInside = 1.0
					m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
					m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
					m_flBiasParameter = 0.0
					m_Curve = 
					{
						m_spline = [  ]
						m_tangents = [  ]
						m_vDomainMins = [ 0.0, 0.0 ]
						m_vDomainMaxs = [ 0.0, 0.0 ]
					}
				}
				m_FloatComponentY = 
				{
					m_nType = ""PF_TYPE_LITERAL""
					m_nMapType = ""PF_MAP_TYPE_DIRECT""
					m_flLiteralValue = 0.0
					m_NamedValue = """"
					m_nControlPoint = 0
					m_nScalarAttribute = 3
					m_nVectorAttribute = 6
					m_nVectorComponent = 0
					m_bReverseOrder = false
					m_flRandomMin = 0.0
					m_flRandomMax = 1.0
					m_bHasRandomSignFlip = false
					m_nRandomSeed = -1
					m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
					m_strSnapshotSubset = """"
					m_flLOD0 = 0.0
					m_flLOD1 = 0.0
					m_flLOD2 = 0.0
					m_flLOD3 = 0.0
					m_nNoiseInputVectorAttribute = 0
					m_flNoiseOutputMin = 0.0
					m_flNoiseOutputMax = 1.0
					m_flNoiseScale = 0.1
					m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
					m_flNoiseOffset = 0.0
					m_nNoiseOctaves = 1
					m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
					m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
					m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
					m_flNoiseTurbulenceScale = 1.0
					m_flNoiseTurbulenceMix = 0.5
					m_flNoiseImgPreviewScale = 1.0
					m_bNoiseImgPreviewLive = true
					m_flNoCameraFallback = 0.0
					m_bUseBoundsCenter = false
					m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
					m_flMultFactor = 1.0
					m_flInput0 = 0.0
					m_flInput1 = 1.0
					m_flOutput0 = 0.0
					m_flOutput1 = 1.0
					m_flNotchedRangeMin = 0.0
					m_flNotchedRangeMax = 1.0
					m_flNotchedOutputOutside = 0.0
					m_flNotchedOutputInside = 1.0
					m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
					m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
					m_flBiasParameter = 0.0
					m_Curve = 
					{
						m_spline = [  ]
						m_tangents = [  ]
						m_vDomainMins = [ 0.0, 0.0 ]
						m_vDomainMaxs = [ 0.0, 0.0 ]
					}
				}
				m_FloatComponentZ = 
				{
					m_nType = ""PF_TYPE_LITERAL""
					m_nMapType = ""PF_MAP_TYPE_DIRECT""
					m_flLiteralValue = 0.0
					m_NamedValue = """"
					m_nControlPoint = 0
					m_nScalarAttribute = 3
					m_nVectorAttribute = 6
					m_nVectorComponent = 0
					m_bReverseOrder = false
					m_flRandomMin = 0.0
					m_flRandomMax = 1.0
					m_bHasRandomSignFlip = false
					m_nRandomSeed = -1
					m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
					m_strSnapshotSubset = """"
					m_flLOD0 = 0.0
					m_flLOD1 = 0.0
					m_flLOD2 = 0.0
					m_flLOD3 = 0.0
					m_nNoiseInputVectorAttribute = 0
					m_flNoiseOutputMin = 0.0
					m_flNoiseOutputMax = 1.0
					m_flNoiseScale = 0.1
					m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
					m_flNoiseOffset = 0.0
					m_nNoiseOctaves = 1
					m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
					m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
					m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
					m_flNoiseTurbulenceScale = 1.0
					m_flNoiseTurbulenceMix = 0.5
					m_flNoiseImgPreviewScale = 1.0
					m_bNoiseImgPreviewLive = true
					m_flNoCameraFallback = 0.0
					m_bUseBoundsCenter = false
					m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
					m_flMultFactor = 1.0
					m_flInput0 = 0.0
					m_flInput1 = 1.0
					m_flOutput0 = 0.0
					m_flOutput1 = 1.0
					m_flNotchedRangeMin = 0.0
					m_flNotchedRangeMax = 1.0
					m_flNotchedOutputOutside = 0.0
					m_flNotchedOutputInside = 1.0
					m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
					m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
					m_flBiasParameter = 0.0
					m_Curve = 
					{
						m_spline = [  ]
						m_tangents = [  ]
						m_vDomainMins = [ 0.0, 0.0 ]
						m_vDomainMaxs = [ 0.0, 0.0 ]
					}
				}
				m_FloatInterp = 
				{
					m_nType = ""PF_TYPE_LITERAL""
					m_nMapType = ""PF_MAP_TYPE_DIRECT""
					m_flLiteralValue = 0.0
					m_NamedValue = """"
					m_nControlPoint = 0
					m_nScalarAttribute = 3
					m_nVectorAttribute = 6
					m_nVectorComponent = 0
					m_bReverseOrder = false
					m_flRandomMin = 0.0
					m_flRandomMax = 1.0
					m_bHasRandomSignFlip = false
					m_nRandomSeed = -1
					m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
					m_strSnapshotSubset = """"
					m_flLOD0 = 0.0
					m_flLOD1 = 0.0
					m_flLOD2 = 0.0
					m_flLOD3 = 0.0
					m_nNoiseInputVectorAttribute = 0
					m_flNoiseOutputMin = 0.0
					m_flNoiseOutputMax = 1.0
					m_flNoiseScale = 0.1
					m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
					m_flNoiseOffset = 0.0
					m_nNoiseOctaves = 1
					m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
					m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
					m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
					m_flNoiseTurbulenceScale = 1.0
					m_flNoiseTurbulenceMix = 0.5
					m_flNoiseImgPreviewScale = 1.0
					m_bNoiseImgPreviewLive = true
					m_flNoCameraFallback = 0.0
					m_bUseBoundsCenter = false
					m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
					m_flMultFactor = 1.0
					m_flInput0 = 0.0
					m_flInput1 = 1.0
					m_flOutput0 = 0.0
					m_flOutput1 = 1.0
					m_flNotchedRangeMin = 0.0
					m_flNotchedRangeMax = 1.0
					m_flNotchedOutputOutside = 0.0
					m_flNotchedOutputInside = 1.0
					m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
					m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
					m_flBiasParameter = 0.0
					m_Curve = 
					{
						m_spline = [  ]
						m_tangents = [  ]
						m_vDomainMins = [ 0.0, 0.0 ]
						m_vDomainMaxs = [ 0.0, 0.0 ]
					}
				}
				m_flInterpInput0 = 0.0
				m_flInterpInput1 = 1.0
				m_vInterpOutput0 = [ 0.0, 0.0, 0.0 ]
				m_vInterpOutput1 = [ 1.0, 1.0, 1.0 ]
				m_Gradient = 
				{
					m_Stops = [  ]
				}
				m_vRandomMin = [ 0.0, 0.0, 0.0 ]
				m_vRandomMax = [ 0.0, 0.0, 0.0 ]
			}
			m_nOutputField = 2
		},
		{
			_class = ""C_OP_RemapTransformOrientationToRotations""
			m_bWriteNormal = true
		},
		{
			_class = ""C_OP_SetVectorAttributeToVectorExpression""
			m_nExpression = ""VECTOR_EXPRESSION_DIVIDE""
			m_vInput1 = 
			{
				m_nType = ""PVEC_TYPE_CP_VALUE""
				m_vLiteralValue = [ 0.0, 0.0, 0.0 ]
				m_LiteralColor = [ 0, 0, 0 ]
				m_NamedValue = """"
				m_bFollowNamedValue = false
				m_nVectorAttribute = 6
				m_vVectorAttributeScale = [ 1.0, 1.0, 1.0 ]
				m_nControlPoint = 1
				m_nDeltaControlPoint = 0
				m_vCPValueScale = [ 1.0, 1.0, 1.0 ]
				m_vCPRelativePosition = [ 0.0, 0.0, 0.0 ]
				m_vCPRelativeDir = [ 1.0, 0.0, 0.0 ]
				m_FloatComponentX = 
				{
					m_nType = ""PF_TYPE_LITERAL""
					m_nMapType = ""PF_MAP_TYPE_DIRECT""
					m_flLiteralValue = 0.0
					m_NamedValue = """"
					m_nControlPoint = 0
					m_nScalarAttribute = 3
					m_nVectorAttribute = 6
					m_nVectorComponent = 0
					m_bReverseOrder = false
					m_flRandomMin = 0.0
					m_flRandomMax = 1.0
					m_bHasRandomSignFlip = false
					m_nRandomSeed = -1
					m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
					m_strSnapshotSubset = """"
					m_flLOD0 = 0.0
					m_flLOD1 = 0.0
					m_flLOD2 = 0.0
					m_flLOD3 = 0.0
					m_nNoiseInputVectorAttribute = 0
					m_flNoiseOutputMin = 0.0
					m_flNoiseOutputMax = 1.0
					m_flNoiseScale = 0.1
					m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
					m_flNoiseOffset = 0.0
					m_nNoiseOctaves = 1
					m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
					m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
					m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
					m_flNoiseTurbulenceScale = 1.0
					m_flNoiseTurbulenceMix = 0.5
					m_flNoiseImgPreviewScale = 1.0
					m_bNoiseImgPreviewLive = true
					m_flNoCameraFallback = 0.0
					m_bUseBoundsCenter = false
					m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
					m_flMultFactor = 1.0
					m_flInput0 = 0.0
					m_flInput1 = 1.0
					m_flOutput0 = 0.0
					m_flOutput1 = 1.0
					m_flNotchedRangeMin = 0.0
					m_flNotchedRangeMax = 1.0
					m_flNotchedOutputOutside = 0.0
					m_flNotchedOutputInside = 1.0
					m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
					m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
					m_flBiasParameter = 0.0
					m_Curve = 
					{
						m_spline = [  ]
						m_tangents = [  ]
						m_vDomainMins = [ 0.0, 0.0 ]
						m_vDomainMaxs = [ 0.0, 0.0 ]
					}
				}
				m_FloatComponentY = 
				{
					m_nType = ""PF_TYPE_LITERAL""
					m_nMapType = ""PF_MAP_TYPE_DIRECT""
					m_flLiteralValue = 0.0
					m_NamedValue = """"
					m_nControlPoint = 0
					m_nScalarAttribute = 3
					m_nVectorAttribute = 6
					m_nVectorComponent = 0
					m_bReverseOrder = false
					m_flRandomMin = 0.0
					m_flRandomMax = 1.0
					m_bHasRandomSignFlip = false
					m_nRandomSeed = -1
					m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
					m_strSnapshotSubset = """"
					m_flLOD0 = 0.0
					m_flLOD1 = 0.0
					m_flLOD2 = 0.0
					m_flLOD3 = 0.0
					m_nNoiseInputVectorAttribute = 0
					m_flNoiseOutputMin = 0.0
					m_flNoiseOutputMax = 1.0
					m_flNoiseScale = 0.1
					m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
					m_flNoiseOffset = 0.0
					m_nNoiseOctaves = 1
					m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
					m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
					m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
					m_flNoiseTurbulenceScale = 1.0
					m_flNoiseTurbulenceMix = 0.5
					m_flNoiseImgPreviewScale = 1.0
					m_bNoiseImgPreviewLive = true
					m_flNoCameraFallback = 0.0
					m_bUseBoundsCenter = false
					m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
					m_flMultFactor = 1.0
					m_flInput0 = 0.0
					m_flInput1 = 1.0
					m_flOutput0 = 0.0
					m_flOutput1 = 1.0
					m_flNotchedRangeMin = 0.0
					m_flNotchedRangeMax = 1.0
					m_flNotchedOutputOutside = 0.0
					m_flNotchedOutputInside = 1.0
					m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
					m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
					m_flBiasParameter = 0.0
					m_Curve = 
					{
						m_spline = [  ]
						m_tangents = [  ]
						m_vDomainMins = [ 0.0, 0.0 ]
						m_vDomainMaxs = [ 0.0, 0.0 ]
					}
				}
				m_FloatComponentZ = 
				{
					m_nType = ""PF_TYPE_LITERAL""
					m_nMapType = ""PF_MAP_TYPE_DIRECT""
					m_flLiteralValue = 0.0
					m_NamedValue = """"
					m_nControlPoint = 0
					m_nScalarAttribute = 3
					m_nVectorAttribute = 6
					m_nVectorComponent = 0
					m_bReverseOrder = false
					m_flRandomMin = 0.0
					m_flRandomMax = 1.0
					m_bHasRandomSignFlip = false
					m_nRandomSeed = -1
					m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
					m_strSnapshotSubset = """"
					m_flLOD0 = 0.0
					m_flLOD1 = 0.0
					m_flLOD2 = 0.0
					m_flLOD3 = 0.0
					m_nNoiseInputVectorAttribute = 0
					m_flNoiseOutputMin = 0.0
					m_flNoiseOutputMax = 1.0
					m_flNoiseScale = 0.1
					m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
					m_flNoiseOffset = 0.0
					m_nNoiseOctaves = 1
					m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
					m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
					m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
					m_flNoiseTurbulenceScale = 1.0
					m_flNoiseTurbulenceMix = 0.5
					m_flNoiseImgPreviewScale = 1.0
					m_bNoiseImgPreviewLive = true
					m_flNoCameraFallback = 0.0
					m_bUseBoundsCenter = false
					m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
					m_flMultFactor = 1.0
					m_flInput0 = 0.0
					m_flInput1 = 1.0
					m_flOutput0 = 0.0
					m_flOutput1 = 1.0
					m_flNotchedRangeMin = 0.0
					m_flNotchedRangeMax = 1.0
					m_flNotchedOutputOutside = 0.0
					m_flNotchedOutputInside = 1.0
					m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
					m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
					m_flBiasParameter = 0.0
					m_Curve = 
					{
						m_spline = [  ]
						m_tangents = [  ]
						m_vDomainMins = [ 0.0, 0.0 ]
						m_vDomainMaxs = [ 0.0, 0.0 ]
					}
				}
				m_FloatInterp = 
				{
					m_nType = ""PF_TYPE_LITERAL""
					m_nMapType = ""PF_MAP_TYPE_DIRECT""
					m_flLiteralValue = 0.0
					m_NamedValue = """"
					m_nControlPoint = 0
					m_nScalarAttribute = 3
					m_nVectorAttribute = 6
					m_nVectorComponent = 0
					m_bReverseOrder = false
					m_flRandomMin = 0.0
					m_flRandomMax = 1.0
					m_bHasRandomSignFlip = false
					m_nRandomSeed = -1
					m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
					m_strSnapshotSubset = """"
					m_flLOD0 = 0.0
					m_flLOD1 = 0.0
					m_flLOD2 = 0.0
					m_flLOD3 = 0.0
					m_nNoiseInputVectorAttribute = 0
					m_flNoiseOutputMin = 0.0
					m_flNoiseOutputMax = 1.0
					m_flNoiseScale = 0.1
					m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
					m_flNoiseOffset = 0.0
					m_nNoiseOctaves = 1
					m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
					m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
					m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
					m_flNoiseTurbulenceScale = 1.0
					m_flNoiseTurbulenceMix = 0.5
					m_flNoiseImgPreviewScale = 1.0
					m_bNoiseImgPreviewLive = true
					m_flNoCameraFallback = 0.0
					m_bUseBoundsCenter = false
					m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
					m_flMultFactor = 1.0
					m_flInput0 = 0.0
					m_flInput1 = 1.0
					m_flOutput0 = 0.0
					m_flOutput1 = 1.0
					m_flNotchedRangeMin = 0.0
					m_flNotchedRangeMax = 1.0
					m_flNotchedOutputOutside = 0.0
					m_flNotchedOutputInside = 1.0
					m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
					m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
					m_flBiasParameter = 0.0
					m_Curve = 
					{
						m_spline = [  ]
						m_tangents = [  ]
						m_vDomainMins = [ 0.0, 0.0 ]
						m_vDomainMaxs = [ 0.0, 0.0 ]
					}
				}
				m_flInterpInput0 = 0.0
				m_flInterpInput1 = 1.0
				m_vInterpOutput0 = [ 0.0, 0.0, 0.0 ]
				m_vInterpOutput1 = [ 1.0, 1.0, 1.0 ]
				m_Gradient = 
				{
					m_Stops = [  ]
				}
				m_vRandomMin = [ 0.0, 0.0, 0.0 ]
				m_vRandomMax = [ 0.0, 0.0, 0.0 ]
			}
			m_vInput2 = 
			{
				m_nType = ""PVEC_TYPE_LITERAL""
				m_vLiteralValue = [ 255.0, 255.0, 255.0 ]
				m_LiteralColor = [ 0, 0, 0 ]
				m_NamedValue = """"
				m_bFollowNamedValue = false
				m_nVectorAttribute = 6
				m_vVectorAttributeScale = [ 1.0, 1.0, 1.0 ]
				m_nControlPoint = 0
				m_nDeltaControlPoint = 0
				m_vCPValueScale = [ 1.0, 1.0, 1.0 ]
				m_vCPRelativePosition = [ 0.0, 0.0, 0.0 ]
				m_vCPRelativeDir = [ 1.0, 0.0, 0.0 ]
				m_FloatComponentX = 
				{
					m_nType = ""PF_TYPE_LITERAL""
					m_nMapType = ""PF_MAP_TYPE_DIRECT""
					m_flLiteralValue = 0.0
					m_NamedValue = """"
					m_nControlPoint = 0
					m_nScalarAttribute = 3
					m_nVectorAttribute = 6
					m_nVectorComponent = 0
					m_bReverseOrder = false
					m_flRandomMin = 0.0
					m_flRandomMax = 1.0
					m_bHasRandomSignFlip = false
					m_nRandomSeed = -1
					m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
					m_strSnapshotSubset = """"
					m_flLOD0 = 0.0
					m_flLOD1 = 0.0
					m_flLOD2 = 0.0
					m_flLOD3 = 0.0
					m_nNoiseInputVectorAttribute = 0
					m_flNoiseOutputMin = 0.0
					m_flNoiseOutputMax = 1.0
					m_flNoiseScale = 0.1
					m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
					m_flNoiseOffset = 0.0
					m_nNoiseOctaves = 1
					m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
					m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
					m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
					m_flNoiseTurbulenceScale = 1.0
					m_flNoiseTurbulenceMix = 0.5
					m_flNoiseImgPreviewScale = 1.0
					m_bNoiseImgPreviewLive = true
					m_flNoCameraFallback = 0.0
					m_bUseBoundsCenter = false
					m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
					m_flMultFactor = 1.0
					m_flInput0 = 0.0
					m_flInput1 = 1.0
					m_flOutput0 = 0.0
					m_flOutput1 = 1.0
					m_flNotchedRangeMin = 0.0
					m_flNotchedRangeMax = 1.0
					m_flNotchedOutputOutside = 0.0
					m_flNotchedOutputInside = 1.0
					m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
					m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
					m_flBiasParameter = 0.0
					m_Curve = 
					{
						m_spline = [  ]
						m_tangents = [  ]
						m_vDomainMins = [ 0.0, 0.0 ]
						m_vDomainMaxs = [ 0.0, 0.0 ]
					}
				}
				m_FloatComponentY = 
				{
					m_nType = ""PF_TYPE_LITERAL""
					m_nMapType = ""PF_MAP_TYPE_DIRECT""
					m_flLiteralValue = 0.0
					m_NamedValue = """"
					m_nControlPoint = 0
					m_nScalarAttribute = 3
					m_nVectorAttribute = 6
					m_nVectorComponent = 0
					m_bReverseOrder = false
					m_flRandomMin = 0.0
					m_flRandomMax = 1.0
					m_bHasRandomSignFlip = false
					m_nRandomSeed = -1
					m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
					m_strSnapshotSubset = """"
					m_flLOD0 = 0.0
					m_flLOD1 = 0.0
					m_flLOD2 = 0.0
					m_flLOD3 = 0.0
					m_nNoiseInputVectorAttribute = 0
					m_flNoiseOutputMin = 0.0
					m_flNoiseOutputMax = 1.0
					m_flNoiseScale = 0.1
					m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
					m_flNoiseOffset = 0.0
					m_nNoiseOctaves = 1
					m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
					m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
					m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
					m_flNoiseTurbulenceScale = 1.0
					m_flNoiseTurbulenceMix = 0.5
					m_flNoiseImgPreviewScale = 1.0
					m_bNoiseImgPreviewLive = true
					m_flNoCameraFallback = 0.0
					m_bUseBoundsCenter = false
					m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
					m_flMultFactor = 1.0
					m_flInput0 = 0.0
					m_flInput1 = 1.0
					m_flOutput0 = 0.0
					m_flOutput1 = 1.0
					m_flNotchedRangeMin = 0.0
					m_flNotchedRangeMax = 1.0
					m_flNotchedOutputOutside = 0.0
					m_flNotchedOutputInside = 1.0
					m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
					m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
					m_flBiasParameter = 0.0
					m_Curve = 
					{
						m_spline = [  ]
						m_tangents = [  ]
						m_vDomainMins = [ 0.0, 0.0 ]
						m_vDomainMaxs = [ 0.0, 0.0 ]
					}
				}
				m_FloatComponentZ = 
				{
					m_nType = ""PF_TYPE_LITERAL""
					m_nMapType = ""PF_MAP_TYPE_DIRECT""
					m_flLiteralValue = 0.0
					m_NamedValue = """"
					m_nControlPoint = 0
					m_nScalarAttribute = 3
					m_nVectorAttribute = 6
					m_nVectorComponent = 0
					m_bReverseOrder = false
					m_flRandomMin = 0.0
					m_flRandomMax = 1.0
					m_bHasRandomSignFlip = false
					m_nRandomSeed = -1
					m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
					m_strSnapshotSubset = """"
					m_flLOD0 = 0.0
					m_flLOD1 = 0.0
					m_flLOD2 = 0.0
					m_flLOD3 = 0.0
					m_nNoiseInputVectorAttribute = 0
					m_flNoiseOutputMin = 0.0
					m_flNoiseOutputMax = 1.0
					m_flNoiseScale = 0.1
					m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
					m_flNoiseOffset = 0.0
					m_nNoiseOctaves = 1
					m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
					m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
					m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
					m_flNoiseTurbulenceScale = 1.0
					m_flNoiseTurbulenceMix = 0.5
					m_flNoiseImgPreviewScale = 1.0
					m_bNoiseImgPreviewLive = true
					m_flNoCameraFallback = 0.0
					m_bUseBoundsCenter = false
					m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
					m_flMultFactor = 1.0
					m_flInput0 = 0.0
					m_flInput1 = 1.0
					m_flOutput0 = 0.0
					m_flOutput1 = 1.0
					m_flNotchedRangeMin = 0.0
					m_flNotchedRangeMax = 1.0
					m_flNotchedOutputOutside = 0.0
					m_flNotchedOutputInside = 1.0
					m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
					m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
					m_flBiasParameter = 0.0
					m_Curve = 
					{
						m_spline = [  ]
						m_tangents = [  ]
						m_vDomainMins = [ 0.0, 0.0 ]
						m_vDomainMaxs = [ 0.0, 0.0 ]
					}
				}
				m_FloatInterp = 
				{
					m_nType = ""PF_TYPE_LITERAL""
					m_nMapType = ""PF_MAP_TYPE_DIRECT""
					m_flLiteralValue = 0.0
					m_NamedValue = """"
					m_nControlPoint = 0
					m_nScalarAttribute = 3
					m_nVectorAttribute = 6
					m_nVectorComponent = 0
					m_bReverseOrder = false
					m_flRandomMin = 0.0
					m_flRandomMax = 1.0
					m_bHasRandomSignFlip = false
					m_nRandomSeed = -1
					m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
					m_strSnapshotSubset = """"
					m_flLOD0 = 0.0
					m_flLOD1 = 0.0
					m_flLOD2 = 0.0
					m_flLOD3 = 0.0
					m_nNoiseInputVectorAttribute = 0
					m_flNoiseOutputMin = 0.0
					m_flNoiseOutputMax = 1.0
					m_flNoiseScale = 0.1
					m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
					m_flNoiseOffset = 0.0
					m_nNoiseOctaves = 1
					m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
					m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
					m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
					m_flNoiseTurbulenceScale = 1.0
					m_flNoiseTurbulenceMix = 0.5
					m_flNoiseImgPreviewScale = 1.0
					m_bNoiseImgPreviewLive = true
					m_flNoCameraFallback = 0.0
					m_bUseBoundsCenter = false
					m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
					m_flMultFactor = 1.0
					m_flInput0 = 0.0
					m_flInput1 = 1.0
					m_flOutput0 = 0.0
					m_flOutput1 = 1.0
					m_flNotchedRangeMin = 0.0
					m_flNotchedRangeMax = 1.0
					m_flNotchedOutputOutside = 0.0
					m_flNotchedOutputInside = 1.0
					m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
					m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
					m_flBiasParameter = 0.0
					m_Curve = 
					{
						m_spline = [  ]
						m_tangents = [  ]
						m_vDomainMins = [ 0.0, 0.0 ]
						m_vDomainMaxs = [ 0.0, 0.0 ]
					}
				}
				m_flInterpInput0 = 0.0
				m_flInterpInput1 = 1.0
				m_vInterpOutput0 = [ 0.0, 0.0, 0.0 ]
				m_vInterpOutput1 = [ 1.0, 1.0, 1.0 ]
				m_Gradient = 
				{
					m_Stops = [  ]
				}
				m_vRandomMin = [ 0.0, 0.0, 0.0 ]
				m_vRandomMax = [ 0.0, 0.0, 0.0 ]
			}
			m_nOutputField = 6
		},
		{
			_class = ""C_OP_RemapCPtoScalar""
			m_nCPInput = 2
			m_nFieldOutput = 7
			m_nField = 1
			m_flInputMax = 255.0
		},
		{
			_class = ""C_OP_SetAttributeToScalarExpression""
			m_bDisableOperator = true
			m_flInput1 = 
			{
				m_nType = ""PF_TYPE_LITERAL""
				m_nMapType = ""PF_MAP_TYPE_DIRECT""
				m_flLiteralValue = 0.9999
				m_NamedValue = """"
				m_nControlPoint = 0
				m_nScalarAttribute = 3
				m_nVectorAttribute = 6
				m_nVectorComponent = 0
				m_bReverseOrder = false
				m_flRandomMin = 0.0
				m_flRandomMax = 1.0
				m_bHasRandomSignFlip = false
				m_nRandomSeed = -1
				m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
				m_strSnapshotSubset = """"
				m_flLOD0 = 0.0
				m_flLOD1 = 0.0
				m_flLOD2 = 0.0
				m_flLOD3 = 0.0
				m_nNoiseInputVectorAttribute = 0
				m_flNoiseOutputMin = 0.0
				m_flNoiseOutputMax = 1.0
				m_flNoiseScale = 0.1
				m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
				m_flNoiseOffset = 0.0
				m_nNoiseOctaves = 1
				m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
				m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
				m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
				m_flNoiseTurbulenceScale = 1.0
				m_flNoiseTurbulenceMix = 0.5
				m_flNoiseImgPreviewScale = 1.0
				m_bNoiseImgPreviewLive = true
				m_flNoCameraFallback = 0.0
				m_bUseBoundsCenter = false
				m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
				m_flMultFactor = 1.0
				m_flInput0 = 0.0
				m_flInput1 = 1.0
				m_flOutput0 = 0.0
				m_flOutput1 = 1.0
				m_flNotchedRangeMin = 0.0
				m_flNotchedRangeMax = 1.0
				m_flNotchedOutputOutside = 0.0
				m_flNotchedOutputInside = 1.0
				m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
				m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
				m_flBiasParameter = 0.0
				m_Curve = 
				{
					m_spline = [  ]
					m_tangents = [  ]
					m_vDomainMins = [ 0.0, 0.0 ]
					m_vDomainMaxs = [ 0.0, 0.0 ]
				}
			}
			m_nOutputField = 38
		},
		{
			_class = ""C_OP_EndCapTimedDecay""
		},
		{
			_class = ""C_OP_SetFloat""
			m_InputValue = 
			{
				m_nType = ""PF_TYPE_CONTROL_POINT_COMPONENT""
				m_nMapType = ""PF_MAP_TYPE_DIRECT""
				m_flLiteralValue = 0.0
				m_NamedValue = """"
				m_nControlPoint = 2
				m_nScalarAttribute = 3
				m_nVectorAttribute = 6
				m_nVectorComponent = 2
				m_bReverseOrder = false
				m_flRandomMin = 0.0
				m_flRandomMax = 1.0
				m_bHasRandomSignFlip = false
				m_nRandomSeed = -1
				m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
				m_strSnapshotSubset = """"
				m_flLOD0 = 0.0
				m_flLOD1 = 0.0
				m_flLOD2 = 0.0
				m_flLOD3 = 0.0
				m_nNoiseInputVectorAttribute = 0
				m_flNoiseOutputMin = 0.0
				m_flNoiseOutputMax = 1.0
				m_flNoiseScale = 0.1
				m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
				m_flNoiseOffset = 0.0
				m_nNoiseOctaves = 1
				m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
				m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
				m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
				m_flNoiseTurbulenceScale = 1.0
				m_flNoiseTurbulenceMix = 0.5
				m_flNoiseImgPreviewScale = 1.0
				m_bNoiseImgPreviewLive = true
				m_flNoCameraFallback = 0.0
				m_bUseBoundsCenter = false
				m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
				m_flMultFactor = 1.0
				m_flInput0 = 0.0
				m_flInput1 = 1.0
				m_flOutput0 = 0.0
				m_flOutput1 = 1.0
				m_flNotchedRangeMin = 0.0
				m_flNotchedRangeMax = 1.0
				m_flNotchedOutputOutside = 0.0
				m_flNotchedOutputInside = 1.0
				m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
				m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
				m_flBiasParameter = 0.0
				m_Curve = 
				{
					m_spline = [  ]
					m_tangents = [  ]
					m_vDomainMins = [ 0.0, 0.0 ]
					m_vDomainMaxs = [ 0.0, 0.0 ]
				}
			}
			m_nOutputField = 38
		},
	]
	m_Renderers = 
	[
		{
			_class = ""C_OP_RenderTrails""
			m_vecTexturesInput = 
			[
				{
					m_hTexture = resource:""_FONT_ATLAS_PATH_""
				},
			]
			m_flRollScale = 
			{
				m_nType = ""PF_TYPE_LITERAL""
				m_nMapType = ""PF_MAP_TYPE_DIRECT""
				m_flLiteralValue = 0.0
				m_NamedValue = """"
				m_nControlPoint = 0
				m_nScalarAttribute = 3
				m_nVectorAttribute = 6
				m_nVectorComponent = 0
				m_bReverseOrder = false
				m_flRandomMin = 0.0
				m_flRandomMax = 1.0
				m_bHasRandomSignFlip = false
				m_nRandomSeed = -1
				m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
				m_strSnapshotSubset = """"
				m_flLOD0 = 0.0
				m_flLOD1 = 0.0
				m_flLOD2 = 0.0
				m_flLOD3 = 0.0
				m_nNoiseInputVectorAttribute = 0
				m_flNoiseOutputMin = 0.0
				m_flNoiseOutputMax = 1.0
				m_flNoiseScale = 0.1
				m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
				m_flNoiseOffset = 0.0
				m_nNoiseOctaves = 1
				m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
				m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
				m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
				m_flNoiseTurbulenceScale = 1.0
				m_flNoiseTurbulenceMix = 0.5
				m_flNoiseImgPreviewScale = 1.0
				m_bNoiseImgPreviewLive = true
				m_flNoCameraFallback = 0.0
				m_bUseBoundsCenter = false
				m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
				m_flMultFactor = 1.0
				m_flInput0 = 0.0
				m_flInput1 = 1.0
				m_flOutput0 = 0.0
				m_flOutput1 = 1.0
				m_flNotchedRangeMin = 0.0
				m_flNotchedRangeMax = 1.0
				m_flNotchedOutputOutside = 0.0
				m_flNotchedOutputInside = 1.0
				m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
				m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
				m_flBiasParameter = 0.0
				m_Curve = 
				{
					m_spline = [  ]
					m_tangents = [  ]
					m_vDomainMins = [ 0.0, 0.0 ]
					m_vDomainMaxs = [ 0.0, 0.0 ]
				}
			}
			m_nLightingControlPoint = 0
			m_nOrientationType = ""PARTICLE_ORIENTATION_ALIGN_TO_PARTICLE_NORMAL""
			m_flMaxLength = 99999.0
			m_bIgnoreDT = true
			m_flConstrainRadiusToLengthRatio = 999999.0
			m_flSelfIllumAmount = 
			{
				m_nType = ""PF_TYPE_CONTROL_POINT_COMPONENT""
				m_nMapType = ""PF_MAP_TYPE_DIRECT""
				m_flLiteralValue = 1.0
				m_NamedValue = """"
				m_nControlPoint = 2
				m_nScalarAttribute = 3
				m_nVectorAttribute = 6
				m_nVectorComponent = 0
				m_bReverseOrder = false
				m_flRandomMin = 0.0
				m_flRandomMax = 1.0
				m_bHasRandomSignFlip = false
				m_nRandomSeed = -1
				m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
				m_strSnapshotSubset = """"
				m_flLOD0 = 0.0
				m_flLOD1 = 0.0
				m_flLOD2 = 0.0
				m_flLOD3 = 0.0
				m_nNoiseInputVectorAttribute = 0
				m_flNoiseOutputMin = 0.0
				m_flNoiseOutputMax = 1.0
				m_flNoiseScale = 0.1
				m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
				m_flNoiseOffset = 0.0
				m_nNoiseOctaves = 1
				m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
				m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
				m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
				m_flNoiseTurbulenceScale = 1.0
				m_flNoiseTurbulenceMix = 0.5
				m_flNoiseImgPreviewScale = 1.0
				m_bNoiseImgPreviewLive = true
				m_flNoCameraFallback = 0.0
				m_bUseBoundsCenter = false
				m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
				m_flMultFactor = 1.0
				m_flInput0 = 0.0
				m_flInput1 = 1.0
				m_flOutput0 = 0.0
				m_flOutput1 = 1.0
				m_flNotchedRangeMin = 0.0
				m_flNotchedRangeMax = 1.0
				m_flNotchedOutputOutside = 0.0
				m_flNotchedOutputInside = 1.0
				m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
				m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
				m_flBiasParameter = 0.0
				m_Curve = 
				{
					m_spline = [  ]
					m_tangents = [  ]
					m_vDomainMins = [ 0.0, 0.0 ]
					m_vDomainMaxs = [ 0.0, 0.0 ]
				}
			}
			m_flDiffuseAmount = 
			{
				m_nType = ""PF_TYPE_LITERAL""
				m_nMapType = ""PF_MAP_TYPE_DIRECT""
				m_flLiteralValue = 0.0
				m_NamedValue = """"
				m_nControlPoint = 0
				m_nScalarAttribute = 3
				m_nVectorAttribute = 6
				m_nVectorComponent = 0
				m_bReverseOrder = false
				m_flRandomMin = 0.0
				m_flRandomMax = 1.0
				m_bHasRandomSignFlip = false
				m_nRandomSeed = -1
				m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
				m_strSnapshotSubset = """"
				m_flLOD0 = 0.0
				m_flLOD1 = 0.0
				m_flLOD2 = 0.0
				m_flLOD3 = 0.0
				m_nNoiseInputVectorAttribute = 0
				m_flNoiseOutputMin = 0.0
				m_flNoiseOutputMax = 1.0
				m_flNoiseScale = 0.1
				m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
				m_flNoiseOffset = 0.0
				m_nNoiseOctaves = 1
				m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
				m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
				m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
				m_flNoiseTurbulenceScale = 1.0
				m_flNoiseTurbulenceMix = 0.5
				m_flNoiseImgPreviewScale = 1.0
				m_bNoiseImgPreviewLive = true
				m_flNoCameraFallback = 0.0
				m_bUseBoundsCenter = false
				m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
				m_flMultFactor = 1.0
				m_flInput0 = 0.0
				m_flInput1 = 1.0
				m_flOutput0 = 0.0
				m_flOutput1 = 1.0
				m_flNotchedRangeMin = 0.0
				m_flNotchedRangeMax = 1.0
				m_flNotchedOutputOutside = 0.0
				m_flNotchedOutputInside = 1.0
				m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
				m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
				m_flBiasParameter = 0.0
				m_Curve = 
				{
					m_spline = [  ]
					m_tangents = [  ]
					m_vDomainMins = [ 0.0, 0.0 ]
					m_vDomainMaxs = [ 0.0, 0.0 ]
				}
			}
			m_nRefractBlurRadius = 5
			m_flFeatheringMaxDist = 
			{
				m_nType = ""PF_TYPE_LITERAL""
				m_nMapType = ""PF_MAP_TYPE_DIRECT""
				m_flLiteralValue = 0.0
				m_NamedValue = """"
				m_nControlPoint = 0
				m_nScalarAttribute = 3
				m_nVectorAttribute = 6
				m_nVectorComponent = 0
				m_bReverseOrder = false
				m_flRandomMin = 0.0
				m_flRandomMax = 1.0
				m_bHasRandomSignFlip = false
				m_nRandomSeed = -1
				m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
				m_strSnapshotSubset = """"
				m_flLOD0 = 0.0
				m_flLOD1 = 0.0
				m_flLOD2 = 0.0
				m_flLOD3 = 0.0
				m_nNoiseInputVectorAttribute = 0
				m_flNoiseOutputMin = 0.0
				m_flNoiseOutputMax = 1.0
				m_flNoiseScale = 0.1
				m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
				m_flNoiseOffset = 0.0
				m_nNoiseOctaves = 1
				m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
				m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
				m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
				m_flNoiseTurbulenceScale = 1.0
				m_flNoiseTurbulenceMix = 0.5
				m_flNoiseImgPreviewScale = 1.0
				m_bNoiseImgPreviewLive = true
				m_flNoCameraFallback = 0.0
				m_bUseBoundsCenter = false
				m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
				m_flMultFactor = 1.0
				m_flInput0 = 0.0
				m_flInput1 = 1.0
				m_flOutput0 = 0.0
				m_flOutput1 = 1.0
				m_flNotchedRangeMin = 0.0
				m_flNotchedRangeMax = 1.0
				m_flNotchedOutputOutside = 0.0
				m_flNotchedOutputInside = 1.0
				m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
				m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
				m_flBiasParameter = 0.0
				m_Curve = 
				{
					m_spline = [  ]
					m_tangents = [  ]
					m_vDomainMins = [ 0.0, 0.0 ]
					m_vDomainMaxs = [ 0.0, 0.0 ]
				}
			}
			m_flMaxSize = 9999999999.0
			m_flStartFadeSize = 
			{
				m_nType = ""PF_TYPE_LITERAL""
				m_nMapType = ""PF_MAP_TYPE_DIRECT""
				m_flLiteralValue = 1000000000000000.0
				m_NamedValue = """"
				m_nControlPoint = 0
				m_nScalarAttribute = 3
				m_nVectorAttribute = 6
				m_nVectorComponent = 0
				m_bReverseOrder = false
				m_flRandomMin = 0.0
				m_flRandomMax = 1.0
				m_bHasRandomSignFlip = false
				m_nRandomSeed = -1
				m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
				m_strSnapshotSubset = """"
				m_flLOD0 = 0.0
				m_flLOD1 = 0.0
				m_flLOD2 = 0.0
				m_flLOD3 = 0.0
				m_nNoiseInputVectorAttribute = 0
				m_flNoiseOutputMin = 0.0
				m_flNoiseOutputMax = 1.0
				m_flNoiseScale = 0.1
				m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
				m_flNoiseOffset = 0.0
				m_nNoiseOctaves = 1
				m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
				m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
				m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
				m_flNoiseTurbulenceScale = 1.0
				m_flNoiseTurbulenceMix = 0.5
				m_flNoiseImgPreviewScale = 1.0
				m_bNoiseImgPreviewLive = true
				m_flNoCameraFallback = 0.0
				m_bUseBoundsCenter = false
				m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
				m_flMultFactor = 1.0
				m_flInput0 = 0.0
				m_flInput1 = 1.0
				m_flOutput0 = 0.0
				m_flOutput1 = 1.0
				m_flNotchedRangeMin = 0.0
				m_flNotchedRangeMax = 1.0
				m_flNotchedOutputOutside = 0.0
				m_flNotchedOutputInside = 1.0
				m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
				m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
				m_flBiasParameter = 0.0
				m_Curve = 
				{
					m_spline = [  ]
					m_tangents = [  ]
					m_vDomainMins = [ 0.0, 0.0 ]
					m_vDomainMaxs = [ 0.0, 0.0 ]
				}
			}
			m_flEndFadeSize = 
			{
				m_nType = ""PF_TYPE_LITERAL""
				m_nMapType = ""PF_MAP_TYPE_DIRECT""
				m_flLiteralValue = 10000000000.0
				m_NamedValue = """"
				m_nControlPoint = 0
				m_nScalarAttribute = 3
				m_nVectorAttribute = 6
				m_nVectorComponent = 0
				m_bReverseOrder = false
				m_flRandomMin = 0.0
				m_flRandomMax = 1.0
				m_bHasRandomSignFlip = false
				m_nRandomSeed = -1
				m_nRandomMode = ""PF_RANDOM_MODE_CONSTANT""
				m_strSnapshotSubset = """"
				m_flLOD0 = 0.0
				m_flLOD1 = 0.0
				m_flLOD2 = 0.0
				m_flLOD3 = 0.0
				m_nNoiseInputVectorAttribute = 0
				m_flNoiseOutputMin = 0.0
				m_flNoiseOutputMax = 1.0
				m_flNoiseScale = 0.1
				m_vecNoiseOffsetRate = [ 0.0, 0.0, 0.0 ]
				m_flNoiseOffset = 0.0
				m_nNoiseOctaves = 1
				m_nNoiseTurbulence = ""PF_NOISE_TURB_NONE""
				m_nNoiseType = ""PF_NOISE_TYPE_PERLIN""
				m_nNoiseModifier = ""PF_NOISE_MODIFIER_NONE""
				m_flNoiseTurbulenceScale = 1.0
				m_flNoiseTurbulenceMix = 0.5
				m_flNoiseImgPreviewScale = 1.0
				m_bNoiseImgPreviewLive = true
				m_flNoCameraFallback = 0.0
				m_bUseBoundsCenter = false
				m_nInputMode = ""PF_INPUT_MODE_CLAMPED""
				m_flMultFactor = 1.0
				m_flInput0 = 0.0
				m_flInput1 = 1.0
				m_flOutput0 = 0.0
				m_flOutput1 = 1.0
				m_flNotchedRangeMin = 0.0
				m_flNotchedRangeMax = 1.0
				m_flNotchedOutputOutside = 0.0
				m_flNotchedOutputInside = 1.0
				m_nRoundType = ""PF_ROUND_TYPE_NEAREST""
				m_nBiasType = ""PF_BIAS_TYPE_STANDARD""
				m_flBiasParameter = 0.0
				m_Curve = 
				{
					m_spline = [  ]
					m_tangents = [  ]
					m_vDomainMins = [ 0.0, 0.0 ]
					m_vDomainMaxs = [ 0.0, 0.0 ]
				}
			}
			m_flAnimationRate = 0.0
			m_nAnimationType = ""ANIMATION_TYPE_MANUAL_FRAMES""
		},
	]
}";

    public const string VMAP =
@"<!-- dmx encoding keyvalues2 4 format vmap 29 -->
""CMapRootElement""
{
    ""id"" ""elementid"" ""3ef5170c-f08c-4ada-a50a-7d204321d3c8""
    ""isprefab"" ""bool"" ""0""
    ""editorbuild"" ""int"" ""8600""
    ""editorversion"" ""int"" ""400""
    ""showgrid"" ""bool"" ""1""
    ""snaprotationangle"" ""int"" ""15""
    ""gridspacing"" ""float"" ""64""
    ""show3dgrid"" ""bool"" ""1""
    ""itemFile"" ""string"" """"
    ""defaultcamera"" ""CStoredCamera""
    {
        ""id"" ""elementid"" ""ea5cdbf9-dfb3-4347-a43a-a463d6ecaa86""
        ""position"" ""vector3"" ""0 -1000 1000""
        ""lookat"" ""vector3"" ""0 0 0""
    }
    ""3dcameras"" ""CStoredCameras""
    {
        ""id"" ""elementid"" ""588c3884-ca60-43d5-afa4-be403f9708ba""
        ""activecamera"" ""int"" ""-1""
        ""cameras"" ""element_array"" [ ]
    }
    ""world"" ""CMapWorld""
    {
        ""id"" ""elementid"" ""2f703208-2b6e-4654-97d8-84e83e404ad5""
        ""nextDecalID"" ""int"" ""0""
        ""fixupEntityNames"" ""bool"" ""1""
        ""mapUsageType"" ""string"" ""standard""
        ""relayPlugData"" ""DmePlugList""
        {
            ""id"" ""elementid"" ""693f5bf7-c9d8-4315-a3a2-08fbdc2d8111""
            ""names"" ""string_array"" [ ]
            ""dataTypes"" ""int_array"" [ ]
            ""plugTypes"" ""int_array"" [ ]
            ""descriptions"" ""string_array"" [ ]
        }
        ""connectionsData"" ""element_array"" [ ]
        ""entity_properties"" ""EditGameClassProps""
        {
            ""id"" ""elementid"" ""d6be94d2-7fa6-4b75-b86d-02105aaf34ef""
            ""classname"" ""string"" ""worldspawn""
        }
        ""origin"" ""vector3"" ""0 0 0""
        ""angles"" ""qangle"" ""0 0 0""
        ""scales"" ""vector3"" ""1 1 1""
        ""nodeID"" ""int"" ""0""
        ""referenceID"" ""uint64"" ""0x0""
        ""children"" ""element_array""
        [
            ""CMapEntity""
            {
                ""id"" ""elementid"" ""62035e16-af70-4641-8e57-4795ff6ed0dc""
                ""hitNormal"" ""vector3"" ""_HEADER_TEXT_ORIGIN_""
                ""isProceduralEntity"" ""bool"" ""0""
                ""relayPlugData"" ""DmePlugList""
                {
                    ""id"" ""elementid"" ""49e2712c-26c0-4103-8615-9112aa2c6e4c""
                    ""names"" ""string_array"" [ ]
                    ""dataTypes"" ""int_array"" [ ]
                    ""plugTypes"" ""int_array"" [ ]
                    ""descriptions"" ""string_array"" [ ]
                }
                ""connectionsData"" ""element_array"" [ ]
                ""entity_properties"" ""EditGameClassProps""
                {
                    ""id"" ""elementid"" ""fbd5da4c-7bb1-4ab0-a4e2-ea0d96ef0b8c""
                    ""classname"" ""string"" ""point_worldtext""
                    ""origin"" ""string"" ""8 0 32""
                    ""angles"" ""string"" ""0 0 90""
                    ""message"" ""string"" ""_HEADER_TEXT_""
                    ""justify_vertical"" ""string"" ""1""
                    ""justify_horizontal"" ""string"" ""1""
                    ""font_size"" ""string"" ""149.5""
                    ""world_units_per_pixel"" ""string"" ""0.06""
                    ""color"" ""string"" ""240 27 27 255""
                    ""editor only"" ""string"" ""1""
                }
                ""origin"" ""vector3"" ""0 0 0""
                ""angles"" ""qangle"" ""0 0 0""
                ""scales"" ""vector3"" ""1 1 1""
                ""nodeID"" ""int"" ""0""
                ""referenceID"" ""uint64"" ""0x0""
                ""children"" ""element_array"" [ ]
                ""editorOnly"" ""bool"" ""1""
                ""force_hidden"" ""bool"" ""0""
                ""transformLocked"" ""bool"" ""0""
                ""variableTargetKeys"" ""string_array"" [ ]
                ""variableNames"" ""string_array"" [ ]
            },
            _ENTS_
        ]
        ""editorOnly"" ""bool"" ""0""
        ""force_hidden"" ""bool"" ""0""
        ""transformLocked"" ""bool"" ""0""
        ""variableTargetKeys"" ""string_array"" [ ]
        ""variableNames"" ""string_array"" [ ]
    }
    ""visibility"" ""CVisibilityMgr""
    {
        ""id"" ""elementid"" ""7b537248-3402-42c7-961a-ca304ee8a0f4""
        ""nodes"" ""element_array"" [ ]
        ""hiddenFlags"" ""int_array"" [ ]
        ""origin"" ""vector3"" ""0 0 0""
        ""angles"" ""qangle"" ""0 0 0""
        ""scales"" ""vector3"" ""1 1 1""
        ""nodeID"" ""int"" ""0""
        ""referenceID"" ""uint64"" ""0x0""
        ""children"" ""element_array"" [ ]
        ""editorOnly"" ""bool"" ""0""
        ""force_hidden"" ""bool"" ""0""
        ""transformLocked"" ""bool"" ""0""
        ""variableTargetKeys"" ""string_array"" [ ]
        ""variableNames"" ""string_array"" [ ]
    }
    ""mapVariables"" ""CMapVariableSet""
    {
        ""id"" ""elementid"" ""79a4cb3e-3490-408d-be9a-cf230e6847b3""
        ""variableNames"" ""string_array"" [ ]
        ""variableValues"" ""string_array"" [ ]
        ""variableTypeNames"" ""string_array"" [ ]
        ""variableTypeParameters"" ""string_array"" [ ]
        ""m_ChoiceGroups"" ""element_array"" [ ]
    }
    ""rootSelectionSet"" ""CMapSelectionSet""
    {
        ""id"" ""elementid"" ""d142b2e2-633d-493a-a960-cf73693f26d6""
        ""children"" ""element_array"" [ ]
        ""selectionSetName"" ""string"" """"
        ""selectionSetData"" ""CObjectSelectionSetDataElement""
        {
            ""id"" ""elementid"" ""4b82ef89-829f-4dd2-988c-ac86563b1a27""
            ""selectedObjects"" ""element_array"" [ ]
        }
    }
    ""m_ReferencedMeshSnapshots"" ""element_array"" [ ]
    ""m_bIsCordoning"" ""bool"" ""0""
    ""m_bCordonsVisible"" ""bool"" ""0""
    ""nodeInstanceData"" ""element_array"" [ ]
}";

    public const string VMAP_FONT_ENTS =
@"
            ""CMapEntity""
            {
                ""id"" ""elementid"" ""_GUID_1_""
                ""name"" ""string"" ""CSUI.particle.font.panel._FONT_NAME_""
                ""hitNormal"" ""vector3"" ""0 0 0""
                ""isProceduralEntity"" ""bool"" ""0""
                ""relayPlugData"" ""DmePlugList""
                {
                    ""id"" ""elementid"" ""_GUID_2_""
                    ""names"" ""string_array"" [ ]
                    ""dataTypes"" ""int_array"" [ ]
                    ""plugTypes"" ""int_array"" [ ]
                    ""descriptions"" ""string_array"" [ ]
                }
                ""connectionsData"" ""element_array"" [ ]
                ""entity_properties"" ""EditGameClassProps""
                {
                    ""id"" ""elementid"" ""_GUID_3_""
                    ""targetname"" ""string"" ""CSUI.particle.font.panel._FONT_NAME_""
                    ""classname"" ""string"" ""info_particle_system""
                    ""origin"" ""string"" ""_ENT_1_ORIGIN_""
                    ""tint_cp"" ""string"" ""1""
                    ""start_active"" ""string"" ""0""
                    ""effect_name"" ""string"" ""particles/csui/fonts/_FONT_NAME_.vpcf""
                }
                ""origin"" ""vector3"" ""0 0 0""
                ""angles"" ""qangle"" ""0 0 0""
                ""scales"" ""vector3"" ""1 1 1""
                ""nodeID"" ""int"" ""0""
                ""referenceID"" ""uint64"" ""0x0""
                ""children"" ""element_array"" [ ]
                ""editorOnly"" ""bool"" ""0""
                ""force_hidden"" ""bool"" ""0""
                ""transformLocked"" ""bool"" ""0""
                ""variableTargetKeys"" ""string_array"" [ ]
                ""variableNames"" ""string_array"" [ ]
            },
            ""CMapEntity""
            {
                ""id"" ""elementid"" ""_GUID_2_""
                ""name"" ""string"" ""CSUI.particle.font.panel._FONT_NAME_.template""
                ""hitNormal"" ""vector3"" ""0 0 0""
                ""isProceduralEntity"" ""bool"" ""0""
                ""relayPlugData"" ""DmePlugList""
                {
                    ""id"" ""elementid"" ""_GUID_4_""
                    ""names"" ""string_array"" [ ]
                    ""dataTypes"" ""int_array"" [ ]
                    ""plugTypes"" ""int_array"" [ ]
                    ""descriptions"" ""string_array"" [ ]
                }
                ""connectionsData"" ""element_array"" [ ]
                ""entity_properties"" ""EditGameClassProps""
                {
                    ""id"" ""elementid"" ""_GUID_5_""
                    ""origin"" ""string"" ""_ENT_2_ORIGIN_""
                    ""targetname"" ""string"" ""CSUI.particle.font.panel._FONT_NAME_.template""
                    ""classname"" ""string"" ""point_template""
                    ""Template01"" ""string"" ""CSUI.particle.font.panel._FONT_NAME_""
                }
                ""origin"" ""vector3"" ""0 0 0""
                ""angles"" ""qangle"" ""0 0 0""
                ""scales"" ""vector3"" ""1 1 1""
                ""nodeID"" ""int"" ""0""
                ""referenceID"" ""uint64"" ""0x0""
                ""children"" ""element_array"" [ ]
                ""editorOnly"" ""bool"" ""0""
                ""force_hidden"" ""bool"" ""0""
                ""transformLocked"" ""bool"" ""0""
                ""variableTargetKeys"" ""string_array"" [ ]
                ""variableNames"" ""string_array"" [ ]
            }";
}
