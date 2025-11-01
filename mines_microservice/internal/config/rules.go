package config

// Rule representa los rangos de valores válidos para un sensor
type Rule struct {
	Min      float64
	Max      float64
	Warning  float64
	Critical float64
	Unit     string
}

// Definir reglas estáticas para cada tipo de sensor
var SensorRules = map[string]Rule{
	"temperature": {Min: 12, Max: 22, Warning: 32, Critical: 40, Unit: "°C"},
	"humidity":    {Min: 40, Max: 60, Warning: 80, Critical: 90, Unit: "%"},
	"ch4":         {Min: 0, Max: 1, Warning: 1.5, Critical: 2, Unit: "%"},
	"o2":          {Min: 19.5, Max: 23, Warning: 18, Critical: 16, Unit: "%"},
}
